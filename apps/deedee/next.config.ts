import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  turbopack: {
    root: path.join(__dirname, "../.."), // Point to monorepo root (absolute path)
  },
  transpilePackages: ["@v1/ui", "@v1/backend"],
  // Temporarily disable typedRoutes for production builds
  // TODO: Fix breadcrumb and dynamic route types
  typedRoutes: process.env.NODE_ENV !== "production",
};

export default nextConfig;
