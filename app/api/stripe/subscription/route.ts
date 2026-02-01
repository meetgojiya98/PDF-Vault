import { NextResponse } from "next/server";
import { stripe } from "../../../../src/services/stripe/stripeServer";
import { getUserByEmail } from "../../../../src/services/stripe/database";

/**
 * Subscription management endpoint
 * GET /api/stripe/subscription?email=user@example.com - Get subscription status
 * POST /api/stripe/subscription - Create customer portal session for management
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const user = getUserByEmail(email);

    if (!user) {
      return NextResponse.json({ 
        error: "No subscription found",
        subscribed: false 
      }, { status: 404 });
    }

    // Get latest subscription data from Stripe
    if (user.subscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(user.subscriptionId);
        
        return NextResponse.json({
          subscribed: true,
          proActive: subscription.status === 'active' || subscription.status === 'trialing',
          status: subscription.status,
          currentPeriodEnd: subscription.current_period_end * 1000,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          cancelAt: subscription.cancel_at ? subscription.cancel_at * 1000 : null,
        });
      } catch (error) {
        console.error("Failed to fetch subscription from Stripe:", error);
      }
    }

    return NextResponse.json({
      subscribed: false,
      exportCredits: user.exportCredits,
    });

  } catch (error: any) {
    console.error("Subscription status error:", error);
    return NextResponse.json({
      error: error.message || "Failed to get subscription status"
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body as { email: string };

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const user = getUserByEmail(email);

    if (!user || !user.customerId) {
      return NextResponse.json({ 
        error: "No customer found" 
      }, { status: 404 });
    }

    // Create Stripe Customer Portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: user.customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/app`,
    });

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error("Customer portal error:", error);
    return NextResponse.json({
      error: error.message || "Failed to create portal session"
    }, { status: 500 });
  }
}
