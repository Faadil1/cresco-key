# Contributing to CRESCO Key

CRESCO Key is currently a deadline-oriented collaborative build. Keep changes easy to review and tied to the canonical product requirements.

## Before coding

Read:

1. `product/PRD.md`
2. `docs/CURRENT-STATE.md`
3. `docs/COLLABORATOR-START-HERE.md`

For authority/security changes, also read:

- `docs/EXACT-PAYMENT-INTENT.md`
- `docs/TECHNICAL-REALITY-CHECK.md`

## Branches

Branch from current `main`.

Suggested prefixes:

- `ux/`
- `fix/`
- `p0/`
- `docs/`
- `test/`

Do not work directly on stale feature branches unless the issue/PR explicitly asks for it.

## Pull requests

A useful PR should explain:

- problem;
- change;
- PRD requirement served;
- screenshots/video where visual;
- tests/CI;
- code-proven vs runtime-proven state;
- known limitations.

Do not merge product-law changes without updating the PRD.

## Security and truth boundaries

Never commit:

- private keys;
- Solana keypair JSON files;
- wallet seed phrases;
- Cloudflare credentials;
- push credentials;
- private relay bearer capabilities;
- production secrets.

Never convert:

- PENDING → success;
- UNKNOWN → success;
- relay state → financial authority;
- UI state → financial authority.

## Product invariants

Preserve:

> The exception moved. The boundary did not.

and:

> The UI is not the guard. The capital path is.

Learning, gamification, context and AI may help understanding. They do not automatically widen financial authority.

## Definition of a useful failure

A refusal is not a broken demo if it proves the capital path is protecting the exact boundary.

Prefer a visible real refusal over a simulated success.
