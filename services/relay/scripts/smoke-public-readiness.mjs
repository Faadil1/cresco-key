// Fail-closed public deployment smoke. Wrangler upload success is not route readiness.
// Never print HTML response bodies; Cloudflare Access/challenge pages may contain tokens.
const base = process.env.DEPLOYMENT_URL?.replace(/\/$/, "");
if (!base || !/^https:\/\/[a-z0-9.-]+$/i.test(base)) {
  throw new Error("MISSING_OR_INVALID_DEPLOYMENT_URL");
}

const expected = [
  { path: "/health", check: (body) =>
    body?.ok === true && body?.service === "cresco-key-boundary-relay" &&
    body?.authority === "coordination-only" },
  { path: "/ready", check: (body) =>
    body?.ok === true && body?.service === "cresco-key-boundary-relay" &&
    body?.authority === "coordination-only" &&
    body?.checks?.boundaryRequestsDurableObject === "configured" },
];

for (const endpoint of expected) {
  let confirmed = false;
  let lastDiagnostic = null;
  for (let attempt = 1; attempt <= 8; attempt++) {
    try {
      const response = await fetch(base + endpoint.path, {
        redirect: "manual",
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(12000),
      });
      const contentType = response.headers.get("content-type") ?? "";
      const responseBody = await response.text();
      let parsed = null;
      if (contentType.toLowerCase().includes("application/json")) {
        try { parsed = JSON.parse(responseBody); }
        catch { /* preserve a JSON parse failure as failure, never a pass */ }
      }
      if (response.ok && parsed && endpoint.check(parsed)) {
        console.log(JSON.stringify({
          status: "ROUTE_VERIFIED",
          endpoint: endpoint.path,
          attempt,
          httpStatus: response.status,
          authority: parsed.authority,
        }));
        confirmed = true;
        break;
      }
      // No body, Location query or credentials in public CI logs.
      lastDiagnostic = {
        endpoint: endpoint.path,
        attempt,
        httpStatus: response.status,
        contentType: contentType.slice(0, 90),
        isHtml: /<!doctype\s+html|<html/i.test(responseBody.slice(0, 150)),
        redirect: response.status >= 300 && response.status < 400,
        cfRayPresent: Boolean(response.headers.get("cf-ray")),
        expectedJsonMissing: !parsed,
      };
    } catch (error) {
      lastDiagnostic = {
        endpoint: endpoint.path,
        attempt,
        networkErrorType: error instanceof Error ? error.name : "UNKNOWN",
      };
    }
    if (attempt < 8) await new Promise((resolve) => setTimeout(resolve, 4000));
  }

  if (!confirmed) {
    console.error(JSON.stringify({
      status: "PUBLIC_ROUTE_NOT_VERIFIED",
      deployedWorkerScriptMayExist: true,
      ...lastDiagnostic,
      operatorNextCheck: "Cloudflare Workers & Pages > cresco-key-boundary-relay > Settings > Domains & Routes: verify workers.dev enabled and no Access challenge. Do not mark live until /ready returns JSON.",
    }, null, 2));
    process.exitCode = 1;
    break;
  }
}
