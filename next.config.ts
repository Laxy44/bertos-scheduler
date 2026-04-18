import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/events", destination: "/", permanent: true },
      { source: "/news", destination: "/", permanent: true },
      { source: "/leave-requests", destination: "/", permanent: true },
      { source: "/leave-accounts", destination: "/", permanent: true },
      { source: "/payslips", destination: "/", permanent: true },
      { source: "/your-leave-overview", destination: "/", permanent: true },
      { source: "/contracted-hours", destination: "/", permanent: true },
      { source: "/account", destination: "/app/settings/general", permanent: true },
      { source: "/availability", destination: "/app/your-availability", permanent: true },
      { source: "/settings", destination: "/app/settings/general", permanent: false },
      { source: "/settings/:path*", destination: "/app/settings/:path*", permanent: true },
      { source: "/your-schedule", destination: "/app/your-schedule", permanent: true },
      { source: "/your-availability", destination: "/app/your-availability", permanent: true },
      { source: "/pending-requests", destination: "/app/pending-requests", permanent: true },
      { source: "/punch-clock", destination: "/app/punch-clock", permanent: true },
      { source: "/profile", destination: "/app/profile", permanent: true },
      { source: "/invites", destination: "/app/invites", permanent: true },
    ];
  },
};

export default nextConfig;
