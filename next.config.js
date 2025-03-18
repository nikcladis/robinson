/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
    domains: ["picsum.photos", "images.unsplash.com"],
  },
};

module.exports = nextConfig;
