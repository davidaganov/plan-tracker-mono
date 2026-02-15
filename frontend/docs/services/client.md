# `ApiClient`

- **Source**: `src/services/client.ts`

## Purpose

Provide a centralized access point for all API request categories.

It is intended to be the main import used by stores and other domain modules.

## Public API

- `ApiClient.user`
- `ApiClient.lists`
- `ApiClient.catalog`
- `ApiClient.settings`
- `ApiClient.locations`
- `ApiClient.templates`

## Side effects

None. This module only aggregates exports.

## Dependencies

- `src/services/requests/**` modules

## Notes

- Prefer adding new API categories here instead of importing request modules directly across the codebase.
- `notifications` is currently an empty placeholder (`{}`).
