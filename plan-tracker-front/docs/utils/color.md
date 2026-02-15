# `getOnColor`

- **Source**: `src/utils/color.ts`

## Purpose

Compute a readable “on color” (text color) for a given background hex color.

## API

- `getOnColor(hex: string): "#0f172a" | "#ffffff"`

## Behavior

- Computes RGB luminance and returns:
  - `#0f172a` for light backgrounds
  - `#ffffff` for dark backgrounds

## Notes

- The function assumes `hex` is a 6-digit hex string (with or without `#`).
