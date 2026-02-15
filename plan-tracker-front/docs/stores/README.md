# Stores documentation

This folder documents Pinia stores from `src/stores/**`.

## How to use these docs

- Read the store doc before changing its public API.
- Stores are the primary place for domain state and server synchronization.

## What each store doc should contain

- **Source**: store file path
- **Purpose**: one paragraph
- **State**: reactive state and what it represents
- **Actions**: exported methods and their side effects
- **External dependencies**: API client modules, other stores
- **Error/loading strategy**: how errors and `isLoading` are managed
- **Notes**: invariants and gotchas

## Index

- `catalog` -> `docs/stores/catalog.md`
- `lists` -> `docs/stores/lists.md`
- `locations` -> `docs/stores/locations.md`
- `settings` -> `docs/stores/settings.md`
- `templates` -> `docs/stores/templates.md`
- `user` -> `docs/stores/user.md`
