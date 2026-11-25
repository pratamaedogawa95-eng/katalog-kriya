import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function buatCSP(nonce) {
  const dev = process.env.NODE_ENV !== "production";
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self'",
    "worker-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(dev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

export async function proxy(req) {
  const nonce = btoa(crypto.randomUUID());
  const csp = buatCSP(nonce);
  const h = new Headers(req.headers);
  h.set("x-nonce", nonce);
  h.set("Content-Security-Policy", csp);
  const lanjut = () => NextResponse.next({ request: { headers: h } });
  const selesai = (res) => { res.headers.set("Content-Security-Policy", csp); return res; };

  const path = req.nextUrl.pathname;
  if (!path.startsWith("/admin")) return selesai(lanjut());

  let res = lanjut();
  const sb = createServerClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll(daftar) {
        daftar.forEach(({ name, value }) => req.cookies.set(name, value));
        res = lanjut();
        daftar.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await sb.auth.getUser();
  const halamanLogin = path === "/admin/login";
  if (!user && !halamanLogin) return selesai(NextResponse.redirect(new URL("/admin/login", req.url)));
  if (user && halamanLogin) return selesai(NextResponse.redirect(new URL("/admin", req.url)));
  return selesai(res);
}

// Semua halaman (bukan file statis) agar CSP bernonce terpasang.
export const config = { matcher: ["/((?!_next/|.*\\..*).*)"] };
