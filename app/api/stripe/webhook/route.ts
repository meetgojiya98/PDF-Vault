import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "../../../../src/services/stripe/stripeServer";
import { setEntitlement } from "../../../../src/services/stripe/entitlementsStore";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature") ?? "";
  const body = await request.text();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json({ error: "Webhook signature failed" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_details?.email;
    if (email) {
      if (session.mode === "subscription" && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        setEntitlement({
          email,
          proActive: subscription.status === "active",
          exportCredits: 0,
          expiresAt: subscription.current_period_end * 1000
        });
      }
      if (session.mode === "payment") {
        setEntitlement({
          email,
          proActive: false,
          exportCredits: 5,
          expiresAt: null
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
