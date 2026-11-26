const aman = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];
export default {
  poweredByHeader: false,
  experimental: { serverActions: { bodySizeLimit: "5mb" } }, // unggah foto produk (maks 4 MB)
  async headers() { return [{ source: "/:path*", headers: aman }]; },
};
