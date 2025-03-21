import { OverviewRoute } from "@/routes";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  redirects: async () => {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.PUBLIC_SUPALLM_API_URL}/:path*`,
        permanent: false,
      },
      {
        source: "/",
        destination: OverviewRoute.path(),
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
