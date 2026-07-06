import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: [
    "@workspace/ui",
    "@workspace/apis",
    "@workspace/i18n",
    "@workspace/schemas",
    "@workspace/utils",
  ],
}

export default nextConfig
