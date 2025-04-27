import Stripe from "stripe";

// Lanzamos un error claro si falta la variable
if (!process.env.STRIPE_SECRET) {
  throw new Error("Stripe secret key (STRIPE_SECRET) is not defined");
}

// Inicializamos STRIPE con la clave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET, {
  apiVersion: "2023-10-16",
});

export async function POST(req) {
  const { priceId } = await req.json();
  // …tu lógica de creación de session
}

// Si usas Edge Runtime o necesitas autenticar, podrías exponer también:
// export const config = { runtime: 'edge' };
