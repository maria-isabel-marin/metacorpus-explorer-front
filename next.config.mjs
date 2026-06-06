/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          "http://metacorpus-explorer-back.railway.internal:8080/api/:path*",
      },
    ];
  },
};

export default nextConfig;
