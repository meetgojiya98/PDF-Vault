import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "../../../../src/services/stripe/stripeServer";
import { upsertUser, getUserByCustomerId, getUserBySubscriptionId } from "../../../../src/services/stripe/database";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature") ?? "";
  const body = await request.text();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    console.error("Webhook signature verification failed:", error.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log(`[Webhook] Received event: ${event.type}`);

  try {
    switch (event.type) {
      // Customer subscribes (checkout completed)
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const email = session.customer_details?.email;
        const customerId = session.customer as string;

        if (!email || !customerId) {
          console.error("Missing email or customer ID in checkout session");
          break;
        }

        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          upsertUser({
            email,
            customerId,
            subscriptionId: subscription.id,
            subscriptionStatus: subscription.status as any,
            proActive: subscription.status === "active" || subscription.status === "trialing",
            exportCredits: 0,
            currentPeriodEnd: subscription.current_period_end * 1000,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });

          console.log(`[Webhook] User subscribed: ${email}`);
        } else if (session.mode === "payment") {
          // One-time payment for export credits
          upsertUser({
            email,
            customerId,
            proActive: false,
            exportCredits: 5,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });

          console.log(`[Webhook] User purchased credits: ${email}`);
        }
        break;
      }

      // Subscription updated (plan change, renewal, etc.)
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const user = getUserBySubscriptionId(subscription.id);

        if (user) {
          upsertUser({
            ...user,
            subscriptionStatus: subscription.status as any,
            proActive: subscription.status === "active" || subscription.status === "trialing",
            currentPeriodEnd: subscription.current_period_end * 1000,
            updatedAt: Date.now(),
          });

          console.log(`[Webhook] Subscription updated: ${user.email} - ${subscription.status}`);
        }
        break;
      }

      // Subscription deleted (canceled and ended)
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const user = getUserBySubscriptionId(subscription.id);

        if (user) {
          upsertUser({
            ...user,
            subscriptionStatus: "canceled",
            proActive: false,
            currentPeriodEnd: subscription.current_period_end * 1000,
            updatedAt: Date.now(),
          });

          console.log(`[Webhook] Subscription canceled: ${user.email}`);
        }
        break;
      }

      // Invoice payment succeeded (renewal)
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const user = getUserByCustomerId(customerId);

        if (user && invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          );

          upsertUser({
            ...user,
            subscriptionStatus: subscription.status as any,
            proActive: subscription.status === "active" || subscription.status === "trialing",
            currentPeriodEnd: subscription.current_period_end * 1000,
            updatedAt: Date.now(),
          });

          console.log(`[Webhook] Invoice paid: ${user.email}`);
        }
        break;
      }

      // Invoice payment failed
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const user = getUserByCustomerId(customerId);

        if (user) {
          upsertUser({
            ...user,
            subscriptionStatus: "past_due",
            proActive: false,
            updatedAt: Date.now(),
          });

          console.log(`[Webhook] Payment failed: ${user.email}`);
        }
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }
  } catch (error: any) {
    console.error(`[Webhook] Error processing ${event.type}:`, error.message);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
