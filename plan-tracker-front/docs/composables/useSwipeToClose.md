# `useSwipeToClose`

- **Source**: `src/composables/useSwipeToClose.ts`

## Purpose

Provide a small gesture helper to close a view/dialog by swiping down.

Supports:

- Touch events (`TouchEvent`)
- Optional mouse drag for desktop testing

## Inputs

- `options: {
  onClose: () => void
  threshold?: number
}`

- `threshold` defaults to `100` pixels.

## Returns

State:

- `isDragging: Ref<boolean>`
- `translateY: Ref<number>`

Handlers:

- `handleTouchStart(e: TouchEvent)`
- `handleTouchMove(e: TouchEvent)`
- `handleTouchEnd()`
- `handleMouseDown(e: MouseEvent)`

## Side effects

- Registers `mousemove`/`mouseup` listeners on `window` while mouse dragging.

## Dependencies

- Vue `ref`

## Usage

Usually combined with a container style:

- translate the container by `translateY`
- disable transitions while dragging

## Notes

- The composable does not prevent default events; callers should decide whether to prevent scroll.
- Reset logic is:
  - if `translateY > threshold` -> call `onClose()`
  - else -> reset `translateY` to `0`
