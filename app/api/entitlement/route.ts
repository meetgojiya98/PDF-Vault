import { NextResponse } from "next/server";
import { stripe } from "../../../src/services/stripe/stripeServer";
import { getEntitlement, setEntitlement } from "../../../src/services/stripe/entitlementsStore";
import { signLicense } from "../../../src/services/stripe/license";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, sessionId } = body as { email?: string; sessionId?: string };

  if (sessionId) {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const customerEmail = session.customer_details?.email;
    if (customerEmail && session.mode === "subscription" && session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      setEntitlement({
        email: customerEmail,
        proActive: subscription.status === "active",
        exportCredits: 0,
        expiresAt: subscription.current_period_end * 1000
      });
    }
    if (customerEmail && session.mode === "payment") {
      setEntitlement({
        email: customerEmail,
        proActive: false,
        exportCredits: 5,
        expiresAt: null
      });
    }
  }

  if (!email && !sessionId) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const record = email ? getEntitlement(email) : null;
  if (!record) {
    return NextResponse.json({ error: "No entitlement found" }, { status: 404 });
  }

  const privateKey = process.env.LICENSE_PRIVATE_KEY ?? "";
  const token = await signLicense(
    {
      proActive: record.proActive,
      exportCredits: record.exportCredits,
      expiresAt: record.expiresAt,
      email: record.email
    },
    privateKey
  );

  return NextResponse.json({ token });
}
