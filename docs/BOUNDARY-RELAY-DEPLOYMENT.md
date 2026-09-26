# Boundary Relay Deployment Gate

The boundary relay is private coordination infrastructure. It is never the authority that allows capital movement.

## GitHub Actions deployment

The manual workflow `Deploy Boundary Relay` requires two repository secrets:

- `CLOUDFLARE_API_TOKEN` — scoped to deploy/edit the target Worker;
- `CLOUDFLARE_ACCOUNT_ID`.

The workflow:

1. installs and tests the relay;
2. deploys with Wrangler;
3. requires a deployment URL;
4. calls `/health`;
5. requires `authority: "coordination-only"`;
6. uploads a deployment receipt artifact.

No Cloudflare credential belongs in repository files or mobile `EXPO_PUBLIC_*` variables.

## Promotion rule

A successful dry-run build or unit test is not `RELAY_LIVE`.

Promote the relay to `RELAY_LIVE` only when a real deployment receipt exists and the deployed `/health` endpoint passes.

Then set the public deployment URL as:

`EXPO_PUBLIC_BOUNDARY_RELAY_URL=<deployment-url>`

The bearer request capability remains private runtime data and must never be committed.
