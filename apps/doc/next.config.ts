import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: [
    "@workspace/ui",
    "@workspace/apis",
    "@workspace/auth",
    "@workspace/i18n",
    "@workspace/schemas",
  ],
}

export default nextConfig
