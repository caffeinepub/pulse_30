# Pulse

## Current State
Pulse is a WhatsApp-like messaging app with dark/gold UI. It has:
- User auth, registration, profile editing
- Direct and group conversations with voice/media messages
- Stories tab (image/video only, 72hr expiry, like/comment)
- Blob storage for media uploads via StorageClient
- MIME type bug: StorageClient.putFile hardcodes `application/octet-stream` for all files, so videos/audio are served without correct MIME type, causing playback failures on mobile

## Requested Changes (Diff)

### Add
- **Channels**: Users can create named channels with description and optional avatar
- **Channel posts**: Text, image, audio recording, and video posts in channels
- **Channel follows**: Users can follow/unfollow channels; follower count shown
- **Channel directory**: Browsable list of all channels for discovery
- **Post interactions**: Like, comment on channel posts; forward posts to existing conversations/groups
- **Channels tab**: Dedicated tab in sidebar alongside Chats, Stories

### Modify
- **StorageClient.putFile**: Accept optional `mimeType` string param; use it as `Content-Type` in `fileHeaders` instead of hardcoded `application/octet-stream`
- **useMediaUpload.ts**: Pass `file.type` as `mimeType` to `putFile` so correct MIME type is stored and served

### Remove
- Nothing removed

## Implementation Plan
1. Fix StorageClient to accept and propagate real MIME type
2. Fix useMediaUpload to pass file.type to putFile
3. Add backend types: Channel, ChannelId, ChannelPost, ChannelPostId, ChannelComment
4. Add backend state: channels map, channelPosts map, channelFollowers map, postLikes map, channelComments map
5. Add backend endpoints:
   - createChannel(name, description, ?avatarUrl) -> ChannelId
   - getAllChannels() -> [(Channel, Nat)] (channel + follower count)
   - getChannelPosts(channelId) -> [ChannelPost]
   - followChannel(channelId) / unfollowChannel(channelId)
   - isFollowingChannel(channelId) -> Bool
   - addChannelPost(channelId, content) -> ChannelPostId
   - likeChannelPost / unlikeChannelPost
   - commentOnChannelPost / getChannelPostComments
   - forwardChannelPost: sends post content as a message in a given conversationId
6. Frontend: Channels tab in sidebar, channel directory view, channel detail view, create channel modal, post composer, post card with like/comment/forward
