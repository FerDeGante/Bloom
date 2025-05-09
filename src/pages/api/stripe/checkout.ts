import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
  apiVersion: "2025-04-30.basil",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method not allowed");
  }

  const body = req.body as any;

  // 1) Determinar los line items: o vienen como array lineItems o viene priceId
  let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  if (Array.isArray(body.lineItems)) {
    lineItems = body.lineItems.map((li: any) => ({
      price: li.price,
      quantity: li.quantity,
    }));
  } else if (typeof body.priceId === "string") {
    lineItems = [{ price: body.priceId, quantity: 1 }];
  } else {
    return res
      .status(400)
      .json({ error: "Debes enviar priceId o lineItems en el body" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      // metadata opcional
      ...(body.metadata && { metadata: body.metadata }),
      success_url: `${process.env.NEXT_PUBLIC_APP_BASE}/dashboard?tab=mis-paquetes`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_BASE}/dashboard?tab=mis-paquetes`,
    });
    return res.status(200).json({ sessionId: session.id });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return res.status(500).json({ error: err.message });
  }
}
