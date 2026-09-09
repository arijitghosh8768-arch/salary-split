# SalarySplit — Cybersecurity & Threat Model Documentation 🔐

As a security-hardened full-stack application, `SalarySplit` implements multiple defensive layers across authentication, API security, database storage, and audit logging.

---

## 1. Security Architecture Summary

```text
               Client Request
                     │
                     ▼
          ┌─────────────────────┐
          |    Helmet Headers   |
          └──────────┬──────────┘
                     ▼
          ┌─────────────────────┐
          | Rate Limiter Guard  |
          └──────────┬──────────┘
                     ▼
          ┌─────────────────────┐
          |  JWT Token Verification|
          └──────────┬──────────┘
                     ▼
          ┌─────────────────────┐
          | Input Sanitization  |
          └──────────┬──────────┘
                     ▼
          ┌─────────────────────┐
          | Parameterized SQL DB|
          └──────────┬──────────┘
                     ▼
          ┌─────────────────────┐
          | Real-Time Audit Log |
          └─────────────────────┘
```

---

## 2. Threat Vector Mitigations

| Threat Vector | Severity | Protection Mechanism |
|---|---|---|
| **SQL Injection (SQLi)** | Critical | 100% Parameterized queries using prepared statements. Zero raw string concatenation. |
| **Credential Brute-Force** | High | IP-based rate limiting on `/api/auth/*` routes (Max 15 attempts / 15 mins). |
| **Password Compromise** | Critical | Passwords hashed using Argon2 / Bcrypt with 10 salt rounds. Plaintext passwords never stored. |
| **Cross-Site Scripting (XSS)** | High | React HTML escaping + Helmet Content-Security-Policy headers. |
| **Data Tampering** | Medium | Central server-side calculation engine validation (re-validates rule sum = 100%). |
| **Unauthenticated Access** | High | JWT authorization headers verified on all non-auth endpoints. |
| **Unauthorized Action Tracking**| Low/Med | Real-time `audit_logs` table tracking user ID, event, client IP address, and payload metadata. |
