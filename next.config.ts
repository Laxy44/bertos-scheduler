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
      { source: "/account", destination: "/settings/general", permanent: true },
      { source: "/availability", destination: "/your-availability", permanent: true },
      { source: "/settings", destination: "/settings/general", permanent: false },
    ];
  },
};

export default nextConfig;
