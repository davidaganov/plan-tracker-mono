# `cn` (class merge)

- **Source**: `src/utils/classmerge.ts`

## Purpose

Provide a single helper for composing `class` strings in Vue templates:

- `clsx` for conditional joining
- `tailwind-merge` for resolving Tailwind class conflicts

## API

- `cn(...inputs: ClassValue[]): string`

## Dependencies

- `clsx`
- `tailwind-merge`

## Usage

Used in UI components to keep template class logic readable.

## Notes

- Prefer using `cn()` instead of manually joining Tailwind classes when conditions are involved.
