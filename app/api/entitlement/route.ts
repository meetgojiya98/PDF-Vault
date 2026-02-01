import { NextResponse } from "next/server";
import { stripe } from "../../../src/services/stripe/stripeServer";
import { getUserByEmail, upsertUser } from "../../../src/services/stripe/database";
import { signLicense } from "../../../src/services/stripe/license";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, sessionId, consumeCredit } = body as { 
      email?: string; 
      sessionId?: string;
      consumeCredit?: boolean;
    };

    // Handle successful checkout via session ID
    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['subscription', 'customer']
      });

      const customerEmail = session.customer_details?.email;
      const customerId = session.customer as string;

      if (!customerEmail || !customerId) {
        return NextResponse.json({
          error: "Invalid checkout session"
        }, { status: 400 });
      }

      let user = getUserByEmail(customerEmail);

      if (session.mode === "subscription" && session.subscription) {
        const subscription = typeof session.subscription === 'string' 
          ? await stripe.subscriptions.retrieve(session.subscription)
          : session.subscription;

        const isActive = subscription.status === "active" || subscription.status === "trialing";

        user = upsertUser({
          email: customerEmail,
          customerId,
          subscriptionId: subscription.id,
          subscriptionStatus: subscription.status as any,
          proActive: isActive,
          exportCredits: 0,
          currentPeriodEnd: subscription.current_period_end * 1000,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      } else if (session.mode === "payment") {
        user = upsertUser({
          email: customerEmail,
          customerId,
          proActive: false,
          exportCredits: (user?.exportCredits || 0) + 5,
          createdAt: user?.createdAt || Date.now(),
          updatedAt: Date.now(),
        });
      }

      if (user) {
        const license = await signLicense(
          {
            customerId: user.customerId,
            email: user.email,
            proActive: user.proActive,
            exportCredits: user.exportCredits,
            exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
          },
          process.env.LICENSE_PRIVATE_KEY!
        );

        return NextResponse.json({ license });
      }
    }

    // Handle license restoration by email
    if (email) {
      let user = getUserByEmail(email);

      // If user exists locally, verify subscription is still active with Stripe
      if (user?.subscriptionId) {
        try {
          const subscription = await stripe.subscriptions.retrieve(user.subscriptionId);
          const isActive = subscription.status === "active" || subscription.status === "trialing";

          // Update if status has changed
          if (isActive !== user.proActive || subscription.status !== user.subscriptionStatus) {
            user = upsertUser({
              ...user,
              subscriptionStatus: subscription.status as any,
              proActive: isActive,
              currentPeriodEnd: subscription.current_period_end * 1000,
              updatedAt: Date.now(),
            });
          }
        } catch (error) {
          console.error("Subscription verification failed:", error);
          // Continue with local data if Stripe API fails
        }
      }

      // If no local record, check Stripe
      if (!user) {
        const customers = await stripe.customers.list({ email, limit: 1 });
        
        if (customers.data.length > 0) {
          const customer = customers.data[0];
          const subscriptions = await stripe.subscriptions.list({
            customer: customer.id,
            status: 'all',
            limit: 1,
          });

          if (subscriptions.data.length > 0) {
            const subscription = subscriptions.data[0];
            const isActive = subscription.status === "active" || subscription.status === "trialing";

            user = upsertUser({
              email,
              customerId: customer.id,
              subscriptionId: subscription.id,
              subscriptionStatus: subscription.status as any,
              proActive: isActive,
              exportCredits: 0,
              currentPeriodEnd: subscription.current_period_end * 1000,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
          } else {
            // Customer exists but no subscription
            user = upsertUser({
              email,
              customerId: customer.id,
              proActive: false,
              exportCredits: 0,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
          }
        }
      }

      // Handle credit consumption
      if (user && consumeCredit && user.exportCredits > 0) {
        user = upsertUser({
          ...user,
          exportCredits: user.exportCredits - 1,
          updatedAt: Date.now(),
        });
      }

      // Generate license token
      if (user) {
        const license = await signLicense(
          {
            customerId: user.customerId,
            email: user.email,
            proActive: user.proActive,
            exportCredits: user.exportCredits,
            exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
          },
          process.env.LICENSE_PRIVATE_KEY!
        );

        return NextResponse.json({ 
          license,
          user: {
            email: user.email,
            proActive: user.proActive,
            exportCredits: user.exportCredits,
            subscriptionStatus: user.subscriptionStatus,
            currentPeriodEnd: user.currentPeriodEnd,
          }
        });
      }

      // No subscription found
      return NextResponse.json({
        error: "No subscription found for this email"
      }, { status: 404 });
    }

    return NextResponse.json({
      error: "Missing email or sessionId"
    }, { status: 400 });

  } catch (error: any) {
    console.error("Entitlement error:", error);
    return NextResponse.json({
      error: error.message || "Failed to process entitlement"
    }, { status: 500 });
  }
}
