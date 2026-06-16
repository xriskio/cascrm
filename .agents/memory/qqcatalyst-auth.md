---
name: QQCatalyst OAuth and API access
description: How to authenticate and which endpoints work for fetching policies
---

## Rule
Always use the `password` grant type (QQ_USERNAME + QQ_PASSWORD + QQ_CLIENT_ID + QQ_CLIENT_SECRET) when fetching policy data. The `client_credentials` grant returns a valid token but every policy API call returns "User cannot be identified."

**Why:** QQCatalyst's policy endpoints require a user-scoped token, not a machine-to-machine client token. client_credentials gives an app-level token that has no agency/user context.

**How to apply:** In auth.ts the `qqAuth.getAccessToken()` already handles this — it checks for QQ_USERNAME/QQ_PASSWORD and switches to `password` grant automatically. When writing standalone scripts, replicate this: use `password` grant when those env vars are present.

## Correct API endpoint for policies
`GET {QQCATALYST_API_URL}/Policies/LastModifiedCreated?startDate=...&endDate=...&pageNumber=...&pageSize=500`

Response shape: `{ Data: [...], PagesTotal: N, TotalItems: N, IsSuccess: true }`

Policy field names (PascalCase): PolicyId, PolicyNumber, CustomerName, ExpirationDate, EffectiveDate, LOB, WritingCarrier, TotalPremium, AgentName

## Wrong endpoint
`/api/v2/policies` — returns 400 "User cannot be identified" even with a valid token.
