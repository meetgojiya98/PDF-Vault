import { NextResponse } from "next/server";
import { stripe } from "../../../../src/services/stripe/stripeServer";

export async function POST(request: Request) {
  const body = await request.json();
  const mode = body.mode === "subscription" ? "subscription" : "payment";

  const priceId =
    mode === "subscription"
      ? process.env.STRIPE_PRICE_SUBSCRIPTION
      : process.env.STRIPE_PRICE_EXPORT_PACK;

  if (!priceId) {
    return NextResponse.json({ error: "Missing Stripe price id" }, { status: 500 });
  }

  const session = await stripe.checkout.sessions.create({
    mode,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/app?success=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/app?canceled=1`,
    allow_promotion_codes: true,
    billing_address_collection: "auto"
  });

  return NextResponse.json({ url: session.url });
}
