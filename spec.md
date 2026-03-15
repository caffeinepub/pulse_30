# Pulse

## Current State
Pulse is a WhatsApp-inspired messaging app with a luxury dark UI accented in gold. It has a Motoko backend and React/TypeScript frontend. Core features are built but several critical bugs persist: admin Gold claim fails with unauthorized error, media MIME types are broken for mobile, universal search bar is missing, and transaction history labels are incorrect.

## Requested Changes (Diff)

### Add
- Universal search bar (left of QR icon in chat list header): search users by username, messages within conversations, posts within channels — inline results grouped by type
- Auto-elevate `@pulse` username to `#admin` role on first profile save

### Modify
- Fix admin Gold claim: `@pulse` must be auto-elevated to `#admin` on `saveCallerUserProfile` when username matches `adminUsername`
- Fix all media uploads: always pass correct MIME type (video/mp4, audio/webm or audio/ogg, image/jpeg etc.) in blob metadata; video elements use `muted` + `playsInline` for iOS compatibility
- Fix transaction history display: Sent = amber with "-" prefix, Received = green, Fee Reward = gold sparkle; most recent first
- Fix Gold claim limit: max is 9,999,999 (not 99,999.99); backend uses `goldMaxClaim = 999_999_900` (units * 100 for 2 decimal places)
- Keep all existing features: DMs, group chats (19 msg pagination, owner badge, add/remove members), stories (72h expiry, image/video, 19/page), channels (19/page, follow, like/comment/forward), Gold wallet (5% fee, dealers 99+ Gold), blocking, profile links/QR, PWA, group avatars, sender avatars in group chats

### Remove
- Notification bell (already removed per user request)

## Implementation Plan
1. **Backend**: Regenerate Motoko with auto-admin elevation for `@pulse`, fixed Gold claim limit (9,999,999), Gold fee distribution, block system, search endpoints
2. **DID files**: Regenerate `backend.did.js` and `backend.did.d.ts` in sync with new backend
3. **Frontend**:
   - Fix media upload hooks to always include correct MIME type in blob storage metadata
   - Add universal search bar component left of QR icon in Sidebar/ChatList header
   - Fix WalletTab transaction history display (correct labels, colors, sort order)
   - Fix video elements: add `muted`, `playsInline`, wait for `canplay` event
   - Ensure all Gold balance displays use 2 decimal places
   - Keep all existing components intact
