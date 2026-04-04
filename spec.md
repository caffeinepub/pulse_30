# Pulse

## Current State
- StorageClient.putFile only accepts two parameters (blobBytes, onProgress); MIME type is never passed or stored, every file is hardcoded to `application/octet-stream`
- useMediaUpload.ts calls putFile with only two args (drops the file's real MIME type)
- MediaMessage video element uses `<source src={url} />` with no `type` attribute, so the browser can't detect the codec
- Reply prefix (buildReplyPrefix) uses `replyingTo.sender.toString().slice(0, 8)` -- a truncated principal ID -- both in the quoted block and in the "Replying to..." panel
- No heart/like reaction system exists on chat messages (only channel posts have likes)

## Requested Changes (Diff)

### Add
- Heart reaction button on each message bubble in DMs and group chats: tap to toggle a ❤️ reaction, tap again to remove it. Show the heart icon and a count below the message bubble. Any user can react to any message.
- Per-message reaction state persisted in localStorage (key: `pulse_reactions_{conversationId}`) so reactions survive page reload for the current user
- A `reactToMessage` frontend-only toggle function (no backend change needed)

### Modify
- StorageClient.putFile: add optional third parameter `mimeType: string = "application/octet-stream"` and use it for the Blob type and the `Content-Type` file header instead of hardcoding
- useMediaUpload.ts: pass `file.type` as the third argument to `storageClient.putFile(rawBytes, progressCallback, file.type)`
- ChatView MediaMessage video element: change `<source src={url} />` to include a dynamic `type` attribute derived from the stored mediaUrl or file MIME type. Use a helper that maps `__kind__` to a sensible default type string (`video/mp4` is fine as fallback but ideally pass the real mime from URL or storage metadata)
- buildReplyPrefix: instead of using `sender.toString().slice(0, 8)`, resolve the sender's display name / username via the already-available `senderProfile` data (use `senderProfile?.username ?? senderProfile?.displayName`). For the current user's own messages use "You". The reply prefix format remains `[REPLY:msgId:senderName:preview]`
- The "Replying to..." panel above the text input (line ~1800): show the sender's username/displayName instead of the principal slice
- MessageBubble QuotedBlock: the `senderName` shown in the quoted reply block should be the username not a principal slice

### Remove
- Hardcoded `application/octet-stream` in StorageClient putFile
- Truncated principal ID usage in reply sender names

## Implementation Plan
1. Update StorageClient.ts: add mimeType param to putFile, pass it to Blob constructor and fileHeaders Content-Type
2. Update useMediaUpload.ts: pass file.type to putFile
3. Update ChatView.tsx MediaMessage video: add type attribute to <source>
4. Update ChatView.tsx buildReplyPrefix: accept senderProfile (or username string) instead of the truncated principal
5. Update ChatView.tsx reply panel (replyingTo block ~line 1800): resolve sender username from profiles map or useGetUserProfile, show it instead of principal slice
6. Update ChatView.tsx MessageBubble reply logic (~line 1104): resolve sender name from senderProfile before building prefix
7. Add heart reaction UI to MessageBubble: small heart icon button below the bubble, localStorage-backed toggle per message per conversation, show count if > 0
