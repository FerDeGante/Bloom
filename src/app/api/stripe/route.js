import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET, { apiVersion: "2023-10-16" });

export async function POST(req) {
  const { priceId } = await req.json();  // lo mandas desde el cliente
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_URL}/confirmacion?ok=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/citas?cancel=1`,
    });
    return Response.json({ url: session.url });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
