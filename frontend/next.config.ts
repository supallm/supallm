import { OverviewRoute } from "@/routes";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  redirects: async () => {
    return [
      {
        source: "/",
        destination: OverviewRoute.path(),
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
