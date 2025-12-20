import type { NextConfig } from "next";

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'http', // 注意：报错链接是 http
        hostname: 'store.is.autonavi.com',
      },
      {
        protocol: 'https', // 为了保险，把 https 也加上
        hostname: 'store.is.autonavi.com',
      },
      // 如果你还有其他域名的图片（比如小红书），也要加在这里
      {
        protocol: 'http',
        hostname: 'sns-webpic-qc.xhscdn.com',
      },
      {
        protocol: 'https',
        hostname: 'sns-webpic-qc.xhscdn.com',
      },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
