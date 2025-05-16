// src/pages/api/stripe/webhook.ts
import { NextApiRequest, NextApiResponse } from "next";
import { buffer } from "micro";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
  apiVersion: "2025-04-30.basil",
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"]!;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error("⚠️ Webhook signature failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const m = session.metadata as any;
    try {
      const dates: string[] = JSON.parse(m.dates);
      const hours: string[] = JSON.parse(m.hours);
      const therapistIds: string[] = JSON.parse(m.therapistIds);
      const serviceId: string = m.serviceId;
      const userId: string = m.userId;

      for (let i = 0; i < dates.length; i++) {
        const [h = 0] = hours[i].split(":").map(Number);
        const dt = new Date(dates[i]);
        dt.setHours(h, 0, 0);
        await prisma.reservation.create({
          data: { userId, serviceId, therapistId: therapistIds[i], date: dt },
        });
      }
    } catch (e) {
      console.error("Error creating reservations in webhook:", e);
    }
  }

  res.status(200).json({ received: true });
}