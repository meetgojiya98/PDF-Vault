import { NextResponse } from "next/server";
import { stripe } from "../../../../src/services/stripe/stripeServer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mode = "subscription", email } = body;

    const priceId =
      mode === "subscription"
        ? process.env.STRIPE_PRICE_SUBSCRIPTION
        : process.env.STRIPE_PRICE_EXPORT_PACK;

    if (!priceId) {
      return NextResponse.json({ error: "Missing Stripe price configuration" }, { status: 500 });
    }

    // Create or retrieve customer
    let customerId: string | undefined;
    if (email) {
      const existingCustomers = await stripe.customers.list({ email, limit: 1 });
      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
      } else {
        const customer = await stripe.customers.create({ email });
        customerId = customer.id;
      }
    }

    const sessionParams: any = {
      mode: mode === "subscription" ? "subscription" : "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/app?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/app?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      customer_email: email,
    };

    if (customerId) {
      sessionParams.customer = customerId;
      delete sessionParams.customer_email;
    }

    // Add metadata for tracking
    sessionParams.metadata = {
      source: "pdf-vault",
      plan: mode === "subscription" ? "pro-monthly" : "export-pack"
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id 
    });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to create checkout session" 
    }, { status: 500 });
  }
}
