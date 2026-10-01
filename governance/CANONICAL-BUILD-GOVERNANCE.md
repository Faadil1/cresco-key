# CRESCO Key — Canonical Build Governance

Status: **ACTIVE**  
Applies to: product, build, hackathon, demo, runtime, evidence, submission, post-submission work.

This file does not replace the PRD. It governs **how** the PRD is executed, proven, promoted, and handed over.

## 2026-10-01 control-plane reconciliation

CRESCO Key now consumes the central `Faadil1/faadil-agent-system` System Control Plane v1 and Product Reality / Integration-First v1.3 **prospectively from this material touch**.

This project-local governance file remains valid where it is consistent with the central canon. The reconciliation does not claim these newer mechanisms were historically active.

Additional active laws:

- **PRODUCT VALUE + REAL ACTION > PROOF ARTIFACTS**
- **EVIDENCE IS EXHAUST OF REAL PRODUCT BEHAVIOR, NOT THE PRIMARY ENGINE**
- **LIVE PRODUCT MODE IS PRIMARY; REPLAY/DETERMINISTIC MODE IS SECONDARY FALLBACK**
- choose the highest safe justified action tier rather than defaulting to read-only for proof convenience;
- after the first real live vertical slice, run the Product Exploitation / Depth Gap loop before terminal polish;
- material claims trace through the Claim → Runtime → Evidence Graph;
- active code-bearing projects without a current Engineering Quality receipt require bounded backfill before terminal-sensitive promotion;
- lifecycle reconstruction from earlier project evidence must be labeled and never backdated.

Control-plane state:

- `governance/PROJECT-CONTROL-PLANE.yaml`
- `governance/BUILD-LIFECYCLE-COVERAGE.yaml`
- `evidence/CLAIM-RUNTIME-EVIDENCE-GRAPH.yaml`

## 1. Mandatory macro lifecycle

Every build passes through:

`QUALIFY → DECIDE → DESIGN → DELIVER → AUDIT → EXPAND`

No lifecycle stage is silently omitted.

For judged / hackathon builds, the mandatory sequence is:

`RUBRIC → PAIN → PROBLEM → NEGATIVE EVENT → DIFFERENTIATOR → EXECUTION → LIVE DEPTH → EVIDENCE → STORY → DEMO → Q&A`

No stage is skipped because the build already "works."

## 2. Product discovery / concept-lock sequence

Before consequential build work:

`Winning Intelligence → Hidden Problem Mining → Divergent Ideation → Winner-to-Winner Collision → Pre-Build Reality Gate → Concept Lock → Technical Reality Check → Backend Engineering Intelligence → Demo-First Architecture → Build`

Rules:

- **No consequential build before Concept Lock.**
- The living PRD must exist before implementation can silently redefine the product.
- Divergent ideation is intentionally unconstrained by current tool permissions, read-only modes, deployment convenience, or remaining deadline.
- Deadline pressure changes **execution sequencing**, not creative ambition.
- Read-only is an execution/safety mode, not the default product concept.
- After Concept Lock, decompose the full product vision into a demo-first vertical slice without shrinking the underlying company/product thesis.
- Collaborator response latency must not block a deadline-critical build; when needed, move into clearly declared solo execution and preserve handoff/state for later re-entry.

## 3. Backend Engineering Intelligence

Backend quality is evaluated after Concept Lock.

Canonical rule:

> **SCALE ON EVIDENCE, NOT ON POSSIBILITY.**

Do not introduce distributed-system complexity, multi-region architecture, queues, caching layers, or enterprise-scale patterns unless justified by actual volume, concurrency, resilience, SLA, latency, throughput, partitioning, growth, or hot-path requirements.

Backend rigor must preserve:

- truth boundaries;
- observability;
- deterministic failure handling;
- reproducibility;
- least authority;
- secrets hygiene;
- explicit external-dependency behavior.

## 4. Mandatory status vocabulary

Historically this project used four operational gateway states. From the 2026-10-01 control-plane reconciliation forward, the project registry may explicitly use:

- **PROVEN** — adequate evidence exists for the bounded claim represented by the gate.
- **ACTIVE** — applies now and is being satisfied / verified.
- **BLOCKED** — required, but a material dependency, authority boundary or proof is missing.
- **PENDING** — applicable and deliberately queued behind a known prerequisite.
- **N/A** — evaluated and not relevant to the current scope, with reason.
- **UNKNOWN** — applicability or factual truth is not yet resolvable from canonical evidence.

Lifecycle completeness uses its separate canonical vocabulary in `governance/BUILD-LIFECYCLE-COVERAGE.yaml`.

Nothing is considered passed merely because it was not discussed. New status semantics are not backdated into earlier records.

## 5. Pre-Build Reality Gate

Required before Concept Lock.

Must prove:

- real problem;
- real user;
- concrete, real, verifiable negative event;
- observable impact;
- design implication;
- product response;
- 5-year durability;
- willingness-to-pay / willingness-to-switch signal where material;
- killer demo;
- native advantage for the target platform/ecosystem.

A negative event must be grounded in reality. A hypothetical threat does not satisfy this gate.

Canonical five-part pattern:

1. Positive signal / opportunity.
2. Concrete negative event.
3. Observable impact.
4. Design lesson.
5. Product response.

## 6. Competitive Novelty / Kill Gate

Required before Concept Lock.

Actively search:

- current products;
- adjacent products;
- repos;
- papers;
- standards;
- prior winners;
- current submissions where visible;
- sponsor-native alternatives;
- underlying infrastructure primitives.

The purpose is not to prove "nobody has ever done this." It is to identify the **residual differentiated mechanism** that survives comparison.

If a nearby product already solves the same problem with the same mechanism and equal/better native fit, mutate or kill the concept.

## 7. Technical Reality Check

Required immediately after Concept Lock.

Must test the smallest real load-bearing path before heavy polish.

When relevant:

- execute the smallest real transaction;
- verify authority/delegation in code;
- fetch exact external data dependencies;
- compile/run the target mobile integration;
- verify network, signer and account assumptions;
- implement failure paths before polishing the success path.

Technical feasibility is not inferred from architecture diagrams.

## 8. Truth Boundary Gate

Every material claim must be classified by evidence:

- **OBSERVED** — directly witnessed/measured from the relevant runtime/evidence.
- **INFERRED** — supported interpretation but not directly observed.
- **UNKNOWN** — not proven.

Do not upgrade UNKNOWN because the expected behavior is obvious.

No fake PASS.

## 9. Negative Path Gate

Every build must preserve a truthful negative state.

Use as applicable:

- **REFUSE**
- **ABSTAIN**
- **REVIEW**
- **UNKNOWN**

Missing evidence must never be converted into success.

For CRESCO Key specifically:

- program refusal is valid product behavior;
- wallet cancellation is not success;
- transaction timeout/unclassified failure is UNKNOWN;
- relay state is not financial authority.

## 10. Evidence Integrity Gate

Every important proof artifact must identify its evidence class:

- **LIVE**
- **LOCAL**
- **LOCAL_STUB**
- **PRESEEDED**
- **SIMULATED**
- **PARTIAL**
- **NOT_IMPLEMENTED**

Do not narrate LOCAL_STUB, PRESEEDED or SIMULATED behavior as LIVE.

Captured video/replay can prove that a run happened; it does not by itself prove a currently live core loop.

## 11. Runtime / Commit Binding Gate

Once a runtime exists, runtime evidence must bind to the actual demonstrated commit.

Record, when material:

- git SHA;
- runtime URL / program id / artifact hash;
- network/environment;
- relevant account/program addresses;
- timestamp;
- evidence receipt.

A later code commit must not inherit runtime proof from an older commit without re-verification.

## 12. Deterministic Demo Gate

Before recording/submission:

- canonical run is defined;
- success path is reproducible;
- negative path is reproducible;
- boundary case is reproducible;
- recovery/fallback is known;
- no fragile hidden manual step;
- no silent state mutation;
- no dependency on a single flaky external service without fallback or explicit truth boundary.

## 13. Judge Performance Assurance

Before submission, verify:

- **signature behavior** — the mechanism judges can see;
- **signature moment** — the memorable live moment;
- **Judge Memory Sentence** — one sentence the judge can repeat later;
- hostile Q&A;
- demo pacing;
- self-serve proof where possible;
- exact claims map to exact evidence.

For CRESCO Key, current signature moment:

`guardian approves recipient A → recipient changes to B → REFUSE → restore A → ALLOW ONCE → replay → REFUSE`

Current Judge Memory Sentence candidate:

> **The exception moved. The boundary did not.**

## 14. Submission Integrity Gate

Before submission, verify:

- eligibility;
- official rubric;
- required sponsor integration;
- repository visibility/content;
- APK/runtime requirements;
- video requirements;
- pitch/deck requirements;
- README claims;
- evidence links;
- licences;
- originality/IP;
- runtime URLs;
- program/network addresses;
- rule-specific disclosures;
- submission form consistency.

A technically strong build can still fail submission integrity.

## 15. Pre-Launch / Ship Assurance

Promotion sequence:

`PRE_LAUNCH_CODE_OK → DEPLOY → LIVE_RUNTIME_CHECK → CRITICAL_PATH_PASS → PROOF_CAPTURED → SHIP`

Where relevant, inspect:

- legal/privacy;
- security/secrets;
- discoverability;
- accessibility;
- performance/latency;
- resilience;
- input/action safety;
- observability;
- conversion/narrative;
- Live Proof.

Do not call code-ready "shipped."

## 16. Distinctiveness Escalation

Functional ≠ finished.

After functional proof, explicitly test:

- agency beyond read-only;
- second act beyond the initial demo;
- consequential memory/state;
- counter-case / hostile case;
- sponsor-native mechanism;
- signature moment;
- category-level differentiation;
- narrative compression.

Do not add features merely to increase feature count.

## 17. Canonical State & Handover

At every meaningful:

- decision;
- gate transition;
- scope change;
- build;
- runtime proof;
- deployment;
- submission;
- post-submission correction,

update canonical project state.

Required state vocabulary should preserve:

- North Star;
- current phase;
- concept lock;
- active/bocked/proven gates;
- truth boundary;
- current runtime/environment;
- evidence level;
- exact next actions;
- protected human actions;
- collaborator ownership;
- known limitations.

Final cycle requires:

- CURRENT;
- HANDOVER;
- final snapshot;
- post-mortem.

## 18. Protected human actions

Actions requiring explicit human execution/approval remain human checkpoints.

Examples may include:

- wallet/key custody decisions;
- external account authentication;
- competition submission;
- legal attestations;
- irreversible production actions;
- collaborator access decisions.

Automation must not silently claim these actions occurred.

## 19. Frozen / submitted projects

No silent retrofit.

Once a project is frozen/submitted, do not rewrite the historical evidence state to make it look stronger.

Reopen explicitly, create a new delta, and preserve the prior submission snapshot.

## 20. Authority boundaries

Canonical orchestration roles remain:

- HOI — pre-lock advisory intelligence;
- PBPD — production through BUILD_CANDIDATE_READY;
- Project Finisher — terminal assurance;
- protected actions — human.

No role silently expands its authority because another component is unavailable.
