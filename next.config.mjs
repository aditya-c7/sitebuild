/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: process.cwd(),
  async redirects() {
    return [
      {
        source: "/chat",
        destination: "/ai",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
