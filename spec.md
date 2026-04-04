# Pulse

## Current State

Pulse is a WhatsApp-inspired messaging PWA with DMs, group chats, channels, stories, Gold credit system, and media sharing. The `Message` type in the backend has: `id`, `sender`, `content` (text, mediaUrl, mediaType), `timestamp`, `readReceipts`. There is no `replyToId` field. `MessageInput` only contains `content`. Media uploads go through `StorageClient.putFile` which currently stores files without preserving MIME types reliably. There is no client-side compression before upload.

## Requested Changes (Diff)

### Add
- `replyToId: ?MessageId` optional field to `Message` type in backend
- `replyToId: ?MessageId` optional field to `MessageInput` type in backend  
- `sendMessage` backend function updated to accept and store `replyToId`
- Client-side image compression to under 1MB before upload (frontend only, using Canvas API)
- Client-side video compression to max 720p before upload (frontend only, using MediaRecorder/canvas)
- WhatsApp-style "Replying to..." bar above the text input in ChatView (DMs and groups)
- Swipe-right or long-press on a message to trigger reply mode
- Quoted reply block displayed inline above each message that is a reply (shows original sender name + truncated text or media type)
- Cancel button on the reply bar to dismiss reply mode

### Modify
- `Message` type: add `replyToId: ?MessageId` field
- `MessageInput` type: add `replyToId: ?MessageId` field
- `sendMessage` function: store `replyToId` from input into the new message
- `useMediaUpload` hook: compress images under 1MB and videos to max 720p before passing to StorageClient
- `ChatView.tsx`: add reply state, reply bar UI, reply quote rendering on messages
- MIME type support: completely unchanged

### Remove
- Nothing removed

## Implementation Plan

1. **Backend:** Add `replyToId: ?MessageId` to `Message` and `MessageInput` types. Update `sendMessage` to pass through `replyToId` when creating a new message. No other backend changes.

2. **Frontend - Media Compression:**
   - In `useMediaUpload` (or a new `useMediaCompression` hook), compress images using Canvas API: draw image onto canvas at reduced quality until file size is under 1MB
   - For videos: use MediaRecorder with constrained resolution (max 720p / 1280x720) if browser supports it; otherwise pass through as-is
   - Compression is invisible to the user -- no UI changes
   - MIME types preserved exactly as before

3. **Frontend - Reply Threading in ChatView:**
   - Add `replyingTo: Message | null` state
   - On long-press or swipe-right of a message bubble, set `replyingTo` to that message
   - Show a dismissable "Replying to [sender display name]" bar above the input with a preview of the original message (truncated text, or "📷 Photo" / "🎥 Video" / "🎤 Voice" for media)
   - When sending, include `replyToId: [replyingTo.id]` in the `MessageInput`; clear `replyingTo` after send
   - In message rendering: if `msg.replyToId` is set, look up the original message from the conversation and render a small quoted block above the message bubble (gold left-border, original sender name, truncated content)
   - Works in both DMs and group chats
