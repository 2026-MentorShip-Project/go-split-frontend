import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Same-origin proxy keeps the backend session cookie first-party.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${process.env.API_URL}/:path*` }];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
