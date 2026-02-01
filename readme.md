
Signal Harbor does not make assumptions about the downstream consumer.  
It only ensures that signals are accepted, shaped, and delivered reliably.

---

## Security Considerations

- Designed to run behind HTTPS
- Supports shared-secret verification for inbound requests
- Treats all external payloads as untrusted
- Does not persist sensitive data by default

Further security hardening should be applied at the deployment or network layer as appropriate.

---

## Deployment

Signal Harbor is intended to be deployed as a small, stateless service.

Common deployment targets include:

- Container-based platforms
- Managed application runtimes
- Edge or boundary network zones

Environment-based configuration is preferred for secrets and routing endpoints.

---

## Non-Goals

Signal Harbor is **not** intended to:

- Replace full workflow engines
- Contain complex business logic
- Perform long-running processing synchronously
- Act as a general-purpose API gateway

---

## License

MIT
