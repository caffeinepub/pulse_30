# Pulse

## Current State
Status viewer shows image/video statuses. Video status fails to play on mobile. No like/comment functionality on statuses. Avatar in status viewer is not clickable.

## Requested Changes (Diff)

### Add
- `likeStatus(statusId)` and `unlikeStatus(statusId)` backend endpoints
- `commentOnStatus(statusId, text)` backend endpoint
- `getStatusInteractions(statusId)` backend endpoint returning like count, liked-by-caller flag, and list of comments with author profile + text + timestamp
- Like button (heart icon) with count shown at bottom of StatusViewer
- Comment input + send button at bottom of StatusViewer, showing recent comments above input
- Clickable avatar in StatusViewer header that opens UserProfileModal for the status creator

### Modify
- Video element in StatusViewer: add `useRef` + `useEffect` to call `.play()` imperatively on mount/status-change; add `webkit-playsinline` data attribute; wrap in pointer-events-auto container to ensure touch events reach controls on iOS
- StatusViewer to accept `currentUserId` prop for like/own-status checks
- StatusView to pass `currentUserId` down to StatusViewer

### Remove
- Nothing removed

## Implementation Plan
1. Add `StatusLike` and `StatusComment` types + state maps to `main.mo`
2. Implement `likeStatus`, `unlikeStatus`, `commentOnStatus`, `getStatusInteractions` endpoints in `main.mo`
3. Update `backend.d.ts` with new types and method signatures
4. Add `useLikeStatus`, `useUnlikeStatus`, `useCommentOnStatus`, `useGetStatusInteractions` hooks to `useQueries.ts`
5. Update `StatusView.tsx`: pass `currentUserId` to `StatusViewer`, add video ref/useEffect fix, add like/comment UI, add avatar click to open `UserProfileModal`
