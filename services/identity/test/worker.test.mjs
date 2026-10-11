import test from "node:test";
import assert from "node:assert/strict";
import identity, { PACKAGE_NAME, parseCertificateFingerprint } from "../src/worker.mjs";

const hex = "a1".repeat(32);
const fingerprint = Array(32).fill("A1").join(":");
const invoke = (path, env = { ANDROID_SIGNING_CERT_SHA256: hex }, method = "GET") =>
  identity.fetch(new Request("https://identity.example" + path, { method }), env);

test("fingerprint parser fails closed on unset, placeholder, truncated and invalid data", () => {
  assert.equal(parseCertificateFingerprint(undefined), null);
  assert.equal(parseCertificateFingerprint("REPLACE_ME"), null);
  assert.equal(parseCertificateFingerprint("ff".repeat(31)), null);
  assert.equal(parseCertificateFingerprint("z1".repeat(32)), null);
  assert.equal(parseCertificateFingerprint(fingerprint.toLowerCase()), fingerprint);
  assert.equal(parseCertificateFingerprint(hex), fingerprint);
});
test("Android Digital Asset Links are exact, JSON, HTTPS-ready and without redirects", async () => {
  const response = await invoke("/.well-known/assetlinks.json");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /application\/json/);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const entries = await response.json();
  assert.equal(entries.length, 1);
  assert.deepEqual(entries[0].relation, ["delegate_permission/common.handle_all_urls"]);
  assert.equal(entries[0].target.namespace, "android_app");
  assert.equal(entries[0].target.package_name, PACKAGE_NAME);
  assert.deepEqual(entries[0].target.sha256_cert_fingerprints, [fingerprint]);
});
test("certificate missing never publishes a fake association", async () => {
  assert.equal((await invoke("/ready", {})).status, 503);
  const response = await invoke("/.well-known/assetlinks.json", {});
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error, "ANDROID_CERTIFICATE_NOT_CONFIGURED");
});
test("public site describes prototype only and does not claim completed payments", async () => {
  const response = await invoke("/");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Freedom with/);
  assert.match(html, /does not, by itself, prove/);
  assert.equal((await invoke("/favicon.png")).headers.get("content-type"), "image/png");
  assert.equal((await invoke("/missing")).status, 404);
  assert.equal((await invoke("/ready", undefined, "POST")).status, 405);
});
