# Services documentation

This folder documents the request / integration layer from `src/services/**`.

## How to use these docs

- Prefer calling API methods through `ApiClient` rather than calling `request` helpers directly from UI.
- Treat Telegram init data as an integration contract.

## Index

Core:

- API client aggregator:
  - `src/services/client.ts` -> `docs/services/client.md`
- Fetch wrapper + auth headers + JSON date revival:
  - `src/services/request.ts` -> `docs/services/request.md`

Request modules:

- Requests index:
  - `src/services/requests/**` -> `docs/services/requests/README.md`
