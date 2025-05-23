// src/pages/api/stripe/webhook.ts
import { buffer } from "micro";
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
  apiVersion: "2025-04-30.basil",
});
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Only POST");
  }
  const raw = await buffer(req);
  const sig = req.headers["stripe-signature"]!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, endpointSecret);
  } catch (e: any) {
    console.error("Webhook sig failed:", e.message);
    return res.status(400).send(`Webhook Error: ${e.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const sess = event.data.object as Stripe.Checkout.Session;
    const m = sess.metadata || {};

    const userId         = m.userId!;
    const priceId        = m.priceId!;
    const serviceId      = m.serviceId!;
    const serviceName    = m.serviceName!;
    const dates          = JSON.parse((m.dates as string) || "[]") as string[];
    const hours          = JSON.parse((m.hours as string) || "[]") as string[];
    const therapistIds   = JSON.parse((m.therapistIds as string) || "[]") as string[];
    const therapistNames = JSON.parse((m.therapistNames as string) || "[]") as string[];

    // 1) Upsert Service
    await prisma.service.upsert({
      where: { id: serviceId },
      update: { name: serviceName },
      create: { id: serviceId, name: serviceName },
    });

    // 2) Upsert Therapists
    for (let i = 0; i < therapistIds.length; i++) {
      await prisma.therapist.upsert({
        where: { id: therapistIds[i] },
        update: { name: therapistNames[i] },
        create: { id: therapistIds[i], name: therapistNames[i] },
      });
    }

    // 3) Upsert UserPackage
    const pkg = await prisma.package.findUnique({ where: { stripePriceId: priceId } });
    if (pkg) {
      await prisma.userPackage.upsert({
        where: { userId_pkgId: { userId, pkgId: pkg.id } },
        update: {},
        create: { userId, pkgId: pkg.id },
      });
    }

    // 4) Crear Reservations
    const recs = dates.map((d, i) => {
      const [h = "0"] = (hours[i] || "0").split(":");
      const dt = new Date(d);
      dt.setHours(parseInt(h, 10), 0, 0, 0);
      return {
        userId,
        serviceId,
        therapistId: therapistIds[i],
        date: dt,
      };
    });
    if (recs.length) {
      await prisma.reservation.createMany({ data: recs, skipDuplicates: true });
    }
  }

  res.status(200).json({ received: true });
}
