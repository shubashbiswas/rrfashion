import type { NextConfig } from "next";

const wordpressHostname =
  process.env.WORDPRESS_HOSTNAME || "us1.wpdemo.org";
const wordpressUrl = process.env.WORDPRESS_URL;

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: wordpressHostname,
        port: "",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    if (!wordpressUrl) {
      return [];
    }
    return [
      {
        source: "/admin",
        destination: `${wordpressUrl}/wp-admin`,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
