# Pulse

## Current State
Pulse is a full-featured messaging PWA with in-app notification bell polling every 15 seconds. The service worker (`sw.js`) handles only install/activate/fetch (offline shell). There is no native push notification support. Users have no way to receive alerts when the app tab is in the background or closed.

## Requested Changes (Diff)

### Add
- Notification permission request flow: after the user completes profile setup, prompt them once to allow notifications
- Native browser notifications via the Notifications API: when a new message arrives (detected via polling) and the app tab is in the background or not focused, show a system notification with sender's username and message preview
- Service worker `push` event handler and `notificationclick` handler so tapping the notification opens/focuses the app
- A `usePushNotifications` hook that:
  - Checks/requests notification permission
  - Watches for new messages/notifications from the existing polling
  - Calls `self.registration.showNotification()` via the service worker when the page is hidden
- Update `sw.js` to handle `push` and `notificationclick` events

### Modify
- `ProfileSetupModal.tsx`: after successful profile save, trigger the notification permission request
- `NotificationBell.tsx` or `MainLayout.tsx`: integrate the push notification hook so new message arrivals show as native notifications when tab is backgrounded
- `sw.js`: add push and notificationclick handlers

### Remove
- Nothing removed

## Implementation Plan
1. Update `sw.js` to add `push` event handler (shows notification) and `notificationclick` handler (focuses/opens the app window)
2. Create `src/frontend/src/hooks/usePushNotifications.ts` hook that:
   - Requests notification permission (called after profile setup)
   - Monitors `document.hidden` state
   - When a new notification/message is received via existing polling and the page is hidden, calls `navigator.serviceWorker.ready.then(sw => sw.showNotification(title, options))`
3. Wire the hook into `MainLayout.tsx` (or `App.tsx`) after login
4. Call `requestNotificationPermission()` from `ProfileSetupModal.tsx` after successful profile save
5. MIME types completely unchanged
