# Prompt: create agent context pack

Create a focused context pack for a coding or documentation task.

Inputs:

- Task description
- Relevant files from `reviewed/`
- Relevant source snippets from `human/`
- Known terminology rules from `_system/AGENTS.md`
- Relevant Blockscape app, map, or documentation context when the task affects Blockscape behavior

Output:

```text
context-packs/<task-slug>.md
```

The context pack should be short enough to paste into Codex or another coding agent. Include only the files and concepts required for the task.

When relevant, include the user's setup path using these Decision Lens facets:

```yaml
decision:
  platform:
    - kubernetes
  setupStep:
    - decide-link-access
  linkAccess:
    - loadbalancer
```

Canonical setup steps:

- `identify-sites`
- `classify-workloads`
- `define-routing-key`
- `configure-listener`
- `configure-connector`
- `decide-link-access`
- `join-sites`
- `validate`

Use `decide-link-access` for OpenShift Route, Kubernetes LoadBalancer, default platform behavior, and no inbound access or edge-style site decisions. Use `join-sites` for CLI token issue/redeem and declarative AccessGrant/AccessToken workflows.
