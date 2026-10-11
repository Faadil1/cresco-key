// Public identity only. No user sessions, payment authority, wallet data or relay capabilities.
export const PACKAGE_NAME = "com.faadil.crescokey";
export function parseCertificateFingerprint(raw) {
  if (typeof raw !== "string") return null;
  const compact = raw.trim().replaceAll(":", "").toUpperCase();
  if (!/^[0-9A-F]{64}$/.test(compact)) return null;
  return compact.match(/.{2}/g).join(":");
}

const commonHeaders = {
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
};
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...commonHeaders, "content-type": "application/json; charset=utf-8" },
  });
}
const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cresco Key — Freedom with Boundaries</title><meta name="description" content="Cresco Key is an Android-first Solana Devnet prototype for progressive financial independence.">
<style>
:root{color-scheme:light;font-family:Georgia,serif;color:#29291f;background:#f4f0e7}
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:30px 20px}
main{width:min(730px,100%);border:1px solid #d5cabb;background:#fbf9f4;padding:clamp(30px,7vw,66px)}
small{font:700 11px system-ui,sans-serif;letter-spacing:2.2px;color:#887358}
h1{font-weight:400;font-size:clamp(47px,9vw,80px);line-height:1.02;letter-spacing:-2px;margin:23px 0}
h1 em{font-weight:400;color:#9c4d37}p{font-size:18px;line-height:1.6;color:#5a554b;max-width:560px}
.rule{height:1px;background:#d5cabb;margin:32px 0}.note{font:13px/1.6 system-ui,sans-serif;color:#655f56}
a{color:#744d36;text-underline-offset:4px}:focus-visible{outline:3px solid #a2503e;outline-offset:3px}
</style></head><body><main><small>SOLANA MOBILE · CRESCO KEY</small>
<h1>Freedom with<br><em>Boundaries.</em></h1>
<p>Give a young person standing financial authority within clear limits. At the boundary, a guardian can review one exact exception without silently widening the Key.</p>
<div class="rule"></div><p class="note">Android-first Solana Devnet prototype. A deployed program and built app do not, by themselves, prove an end-to-end payment or production financial service. This domain exists to identify the Android application; it does not hold wallets, funds, or signing authority.</p>
<p class="note"><a href="https://github.com/Faadil1/cresco-key">Project source &amp; technical evidence</a></p>
</main></body></html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method !== "GET" && request.method !== "HEAD") {
      return json({ error: "METHOD_NOT_ALLOWED" }, 405);
    }
    const fingerprint = parseCertificateFingerprint(env?.ANDROID_SIGNING_CERT_SHA256);
    if (url.pathname === "/ready") {
      return json({
        ok: fingerprint !== null,
        service: "cresco-key-identity",
        androidPackage: PACKAGE_NAME,
        certificateConfigured: fingerprint !== null,
        // Not a wallet trust, Android OS association, or on-device runtime claim.
        associationRuntimeVerified: false,
      }, fingerprint ? 200 : 503);
    }
    if (url.pathname === "/.well-known/assetlinks.json") {
      if (!fingerprint) return json({ error: "ANDROID_CERTIFICATE_NOT_CONFIGURED" }, 503);
      return json([{
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: PACKAGE_NAME,
          sha256_cert_fingerprints: [fingerprint],
        },
      }]);
    }
    if (url.pathname === "/") {
      return new Response(request.method === "HEAD" ? null : page, {
        headers: { ...commonHeaders, "content-type": "text/html; charset=utf-8",
          "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'" },
      });
    }
    // Wallet MWA clients may request icon relative to identity URI.
    if (url.pathname === "/favicon.png") {
      const bytes = Uint8Array.from(atob(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/VFsAAAAASUVORK5CYII="
      ), char => char.charCodeAt(0));
      return new Response(request.method === "HEAD" ? null : bytes, {
        headers: { ...commonHeaders, "content-type": "image/png" },
      });
    }
    return json({ error: "NOT_FOUND" }, 404);
  },
};
