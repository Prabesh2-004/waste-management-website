const nextConfig = {
  // Self-contained server build for the Docker image.
  output: "standalone",
  // Phones on the same Wi-Fi open the dev server by its LAN address (see npm run dev:mobile).
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*", "*.local"],
  // With NEXT_PUBLIC_API_URL="" the browser calls /api/v1 on this site and Next.js
  // forwards it to the backend. One origin means one HTTPS certificate for phones.
  rewrites() {
    const backend = (process.env.BACKEND_URL ?? "http://localhost:8000").replace(/\/$/, "");
    return [{ source: "/api/v1/:path*", destination: `${backend}/api/v1/:path*` }];
  },
};

export default nextConfig;
