# `useDeleteSnackbar`

- **Source**: `src/composables/useDeleteSnackbar.ts`

## Purpose

Provide a reusable “soft delete with undo” snackbar flow:

- show a message
- schedule a hard delete after a timeout
- allow undo or immediate confirm

## Inputs

- `options: {
  timeout?: number
  onHardDelete: (ids: string[]) => Promise<void> | void
}`

## Returns

- `snackbar: Ref<{ show: boolean; message: string; ids: string[]; context: string }>`
- `showDeleteSnackbar(ids: string[], context: string): void`
- `handleUndo(onUndo: (ids: string[]) => void): void`
- `handleConfirm(): Promise<void>`

## Side effects

- Starts and clears `setTimeout` timers.
- Uses i18n translation:
  - `t("common.messages.deleted", { count })`

## Dependencies

- `vue-i18n` for `t()`
- Caller-provided delete/undo logic.

## Usage

Typical pattern:

- on “Delete” action:
  - soft-delete locally (hide items)
  - call `showDeleteSnackbar(ids, context)`
- on undo:
  - call `handleUndo(undoDelete)`
- on confirm:
  - call `handleConfirm()`

## Notes

- `context` is stored but not interpreted by the composable; it is intended for UI-level differentiation (e.g. which tab/page triggered the deletion).
- On component unmount, pending timeouts are cleared.
