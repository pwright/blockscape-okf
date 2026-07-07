# Prompt: promote generated OKF

Review a generated OKF page and decide whether it can be promoted to `reviewed/`.

Checks:

- The source paths exist under `human/`.
- The summary is faithful to the source.
- The terminology matches current Blockscape documentation.
- The page is small and focused.
- The `related` links are useful and not hallucinated.
- Decision Lens metadata is accurate and conservative:
  - Kubernetes-only content is not marked as Podman, Docker, Linux, or `local-system`.
  - Podman/local-system content is not marked as Kubernetes-only.
  - Setup workflows use the right `decision.setupStep`, especially `decide-link-access`, `join-sites`, and `validate`.
  - Link access pages use `decision.linkAccess` only when the source explicitly discusses OpenShift Route, LoadBalancer, default behavior, or no inbound access.
  - Site joining pages use `decision.joinMethod` only when the source explicitly discusses CLI token issue/redeem or declarative AccessGrant/AccessToken.
  - Generic cross-platform concepts omit `decision` fields unless applicability is explicit.

When promoting:

- Move the page from `generated/` to the matching path under `reviewed/`.
- Change `status` to `reviewed`.
- Change `reviewed` to `true`.
- Add `reviewed_by` and `reviewed_at`.
- Keep source provenance.
