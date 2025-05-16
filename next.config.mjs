// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  api: {
    bodyParser: false, // necesario para Stripe webhooks
  },
};

export default nextConfig;