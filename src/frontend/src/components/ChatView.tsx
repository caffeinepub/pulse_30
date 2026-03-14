import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  Image as ImageIcon,
  Mic,
  Paperclip,
  Send,
  Square,
  Video,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { ConversationId, MediaType, Message } from "../backend";
import { useMediaUpload } from "../hooks/useMediaUpload";
import {
  useGetMessages,
  useGetUserProfile,
  useIsUserOnline,
  useListUserConversations,
  useMarkMessagesAsRead,
  useSendMessage,
} from "../hooks/useQueries";
import UserProfileModal from "./UserProfileModal";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatTime(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  if (ms === 0) return "";
  return new Date(ms).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatLastSeen(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  if (ms === 0) return "";
  const now = Date.now();
  const diff = now - ms;
  if (diff < 60000) return "last seen just now";
  if (diff < 3600000) return `last seen ${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `last seen ${Math.floor(diff / 3600000)}h ago`;
  return `last seen ${new Date(ms).toLocaleDateString()}`;
}

interface ReadReceiptIconProps {
  message: Message;
  currentUserId: string;
  memberCount: number;
}

function ReadReceiptIcon({
  message,
  currentUserId,
  memberCount,
}: ReadReceiptIconProps) {
  if (message.sender.toString() !== currentUserId) return null;

  const readCount = message.readReceipts.filter(
    (r) => r.userId.toString() !== currentUserId,
  ).length;
  const othersCount = memberCount - 1;

  if (readCount === 0) {
    return <Check className="h-3 w-3 text-muted-foreground" />;
  }
  if (readCount >= othersCount && othersCount > 0) {
    return (
      <CheckCheck
        className="h-3 w-3"
        style={{ color: "oklch(0.82 0.15 72)" }}
      />
    );
  }
  return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
}

interface MediaMessageProps {
  url: string;
  mediaType: MediaType;
  onImageClick: (url: string) => void;
}

function MediaMessage({ url, mediaType, onImageClick }: MediaMessageProps) {
  if (mediaType.__kind__ === "image") {
    return (
      <button
        type="button"
        onClick={() => onImageClick(url)}
        className="block cursor-pointer rounded-lg overflow-hidden mt-1"
        aria-label="View full image"
      >
        <img
          src={url}
          alt="Shared media"
          className="max-w-[240px] max-h-[300px] object-cover"
          loading="lazy"
        />
      </button>
    );
  }
  if (mediaType.__kind__ === "video") {
    return (
      // biome-ignore lint/a11y/useMediaCaption: user-uploaded video, captions unavailable
      <video
        src={url}
        controls
        muted
        playsInline
        className="max-w-[240px] max-h-[240px] rounded-lg mt-1"
        style={{ display: "block" }}
      />
    );
  }
  if (mediaType.__kind__ === "audio") {
    return (
      // biome-ignore lint/a11y/useMediaCaption: user-uploaded audio, captions unavailable
      <audio
        data-ocid="chat.audio_player"
        controls
        src={url}
        className="max-w-[240px] rounded-lg mt-1"
      />
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline text-sm"
    >
      View media
    </a>
  );
}

interface MessageBubbleProps {
  message: Message;
  currentUserId: string;
  memberCount: number;
  isGroup: boolean;
  showSender: boolean;
  onImageClick: (url: string) => void;
  index: number;
}

function MessageBubble({
  message,
  currentUserId,
  memberCount,
  isGroup,
  showSender,
  onImageClick,
  index,
}: MessageBubbleProps) {
  const isSent = message.sender.toString() === currentUserId;
  const senderId = message.sender.toString();
  const { data: senderProfile } = useGetUserProfile(
    isGroup && !isSent ? senderId : null,
  );

  const senderName = senderProfile?.displayName ?? senderId.slice(0, 8);

  return (
    <motion.div
      data-ocid={`chat.message.${index + 1}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-end gap-2 ${
        isSent ? "flex-row-reverse" : "flex-row"
      } mb-1`}
    >
      {!isSent && isGroup && (
        <Avatar className="w-7 h-7 shrink-0 mb-0.5">
          <AvatarFallback
            className="text-xs font-semibold"
            style={{
              background: "oklch(0.76 0.13 72 / 0.2)",
              color: "oklch(0.82 0.15 72)",
            }}
          >
            {getInitials(senderName)}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={`flex flex-col ${
          isSent ? "items-end" : "items-start"
        } max-w-[85%] sm:max-w-[72%]`}
      >
        {isGroup && !isSent && showSender && (
          <span
            className="text-xs font-medium mb-1"
            style={{ color: "oklch(0.82 0.15 72)" }}
          >
            {senderName}
          </span>
        )}
        <div
          className={`rounded-2xl px-3 py-2 ${
            isSent
              ? "message-bubble-sent rounded-br-sm"
              : "message-bubble-received rounded-bl-sm"
          }`}
        >
          {message.content.mediaUrl && message.content.mediaType && (
            <MediaMessage
              url={message.content.mediaUrl}
              mediaType={message.content.mediaType}
              onImageClick={onImageClick}
            />
          )}
          {message.content.text && (
            <p className="text-sm text-foreground leading-relaxed break-words">
              {message.content.text}
            </p>
          )}
          <div
            className={`flex items-center gap-1 mt-0.5 ${
              isSent ? "justify-end" : "justify-start"
            }`}
          >
            <span className="text-xs text-muted-foreground">
              {formatTime(message.timestamp)}
            </span>
            <ReadReceiptIcon
              message={message}
              currentUserId={currentUserId}
              memberCount={memberCount}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface ChatViewProps {
  conversationId: ConversationId;
  currentUserId: string;
  onBack: () => void;
  onOpenUserProfile?: (userId: string) => void;
}

export default function ChatView({
  conversationId,
  currentUserId,
  onBack,
  onOpenUserProfile,
}: ChatViewProps) {
  const [text, setText] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingFilePreview, setPendingFilePreview] = useState<string | null>(
    null,
  );
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: messages = [] } = useGetMessages(conversationId);
  const { data: conversations } = useListUserConversations();
  const { mutateAsync: sendMessage, isPending: sending } = useSendMessage();
  const { mutate: markRead } = useMarkMessagesAsRead();
  const { uploadMedia, uploadProgress, isUploading } = useMediaUpload();

  const conversation = conversations?.find((c) => c.id === conversationId);
  const isGroup = conversation?.type.__kind__ === "group";
  const groupName =
    conversation?.type.__kind__ === "group"
      ? (conversation.type as { __kind__: "group"; group: string }).group
      : null;
  const otherUserId = !isGroup
    ? (conversation?.members
        .find((m) => m.toString() !== currentUserId)
        ?.toString() ?? null)
    : null;

  const { data: otherProfile } = useGetUserProfile(otherUserId);
  const { data: isOnline } = useIsUserOnline(otherUserId);

  const chatName = isGroup
    ? (groupName ?? "Group")
    : (otherProfile?.displayName ?? otherUserId?.slice(0, 8) ?? "Chat");
  const memberCount = conversation?.members.length ?? 2;

  const msgCount = messages.length;

  useEffect(() => {
    if (conversationId) markRead(conversationId);
  }, [conversationId, markRead]);

  useEffect(() => {
    if (msgCount !== prevMessageCountRef.current) {
      prevMessageCountRef.current = msgCount;
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [msgCount]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on conversation change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, [conversationId]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 50 * 1024 * 1024) {
        toast.error("File size must be under 50MB");
        return;
      }
      setPendingFile(file);
      const url = URL.createObjectURL(file);
      setPendingFilePreview(url);
    },
    [],
  );

  const clearPendingFile = useCallback(() => {
    if (pendingFilePreview) URL.revokeObjectURL(pendingFilePreview);
    setPendingFile(null);
    setPendingFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [pendingFilePreview]);

  const handleSend = async () => {
    if (!text.trim() && !pendingFile) return;

    let mediaUrl: string | undefined;
    let mediaType: MediaType | undefined;

    if (pendingFile) {
      try {
        const result = await uploadMedia(pendingFile);
        mediaUrl = result.url;
        mediaType = result.mediaType;
        clearPendingFile();
      } catch {
        toast.error("Failed to upload media");
        return;
      }
    }

    try {
      await sendMessage({
        conversationId,
        messageInput: {
          content: {
            text: text.trim(),
            ...(mediaUrl ? { mediaUrl } : {}),
            ...(mediaType ? { mediaType } : {}),
          },
        },
      });
      setText("");
    } catch {
      toast.error("Failed to send message");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Voice recording — click to start
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/ogg";
      const recorder = new MediaRecorder(stream, { mimeType });
      recordingChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordingChunksRef.current.push(e.data);
      };
      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setRecordingSeconds(0);
      setIsRecording(true);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch (err: unknown) {
      const error = err as { name?: string };
      if (
        error?.name === "NotAllowedError" ||
        error?.name === "PermissionDeniedError"
      ) {
        toast.error("Microphone permission denied");
      } else {
        toast.error("Could not start recording");
      }
    }
  }, []);

  // Cancel without sending
  const cancelRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
      for (const t of recorder.stream?.getTracks() ?? []) t.stop();
    }
    mediaRecorderRef.current = null;
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    setRecordingSeconds(0);
  }, []);

  // Stop and send the recording
  const sendRecording = useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;

    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    setRecordingSeconds(0);

    await new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
      recorder.stop();
    });
    for (const t of recorder.stream?.getTracks() ?? []) t.stop();
    mediaRecorderRef.current = null;

    const mimeType = recorder.mimeType || "audio/webm";
    const blob = new Blob(recordingChunksRef.current, { type: mimeType });
    const ext = mimeType.includes("ogg") ? "ogg" : "webm";
    const audioFile = new File([blob], `audio_recording.${ext}`, {
      type: mimeType,
    });

    try {
      const result = await uploadMedia(audioFile);
      await sendMessage({
        conversationId,
        messageInput: {
          content: {
            text: "",
            mediaUrl: result.url,
            mediaType: result.mediaType,
          },
        },
      });
    } catch {
      toast.error("Failed to send voice message");
    }
  }, [uploadMedia, sendMessage, conversationId]);

  const handleAvatarClick = () => {
    if (!isGroup && otherUserId) {
      if (onOpenUserProfile) {
        onOpenUserProfile(otherUserId);
      } else {
        setProfileModalOpen(true);
      }
    }
  };

  const formatRecordingTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-background">
      {/* Header */}
      <div
        data-ocid="chat.header"
        className="flex items-center gap-3 px-4 py-3 border-b border-border bg-sidebar shrink-0"
      >
        <Button
          size="icon"
          variant="ghost"
          onClick={onBack}
          className="md:hidden h-9 w-9 rounded-xl"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <button
          type="button"
          onClick={handleAvatarClick}
          className={
            !isGroup && otherUserId ? "cursor-pointer" : "cursor-default"
          }
          aria-label={!isGroup ? "View profile" : undefined}
        >
          <Avatar className="w-10 h-10">
            {otherProfile?.avatarUrl && (
              <AvatarImage src={otherProfile.avatarUrl} alt={chatName} />
            )}
            <AvatarFallback
              className="text-sm font-semibold"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.76 0.13 72 / 0.3), oklch(0.65 0.11 65 / 0.2))",
                color: "oklch(0.82 0.15 72)",
                border: "1px solid oklch(0.76 0.13 72 / 0.3)",
              }}
            >
              {getInitials(chatName)}
            </AvatarFallback>
          </Avatar>
        </button>

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-sm text-foreground truncate">
            {chatName}
          </h2>
          {!isGroup && (
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  background: isOnline
                    ? "oklch(0.72 0.20 140)"
                    : "oklch(0.45 0.01 70)",
                  boxShadow: isOnline
                    ? "0 0 6px oklch(0.72 0.20 140 / 0.6)"
                    : "none",
                }}
              />
              <span className="text-xs text-muted-foreground">
                {isOnline
                  ? "Online"
                  : otherProfile
                    ? formatLastSeen(otherProfile.lastSeen)
                    : ""}
              </span>
            </div>
          )}
          {isGroup && (
            <p className="text-xs text-muted-foreground">
              {memberCount} members
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
        <div data-ocid="chat.message_list" className="flex flex-col px-4 py-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-sm text-muted-foreground">
                No messages yet. Say hello! 👋
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const prevMsg = idx > 0 ? messages[idx - 1] : null;
              const showSender =
                !prevMsg || prevMsg.sender.toString() !== msg.sender.toString();
              return (
                <MessageBubble
                  key={msg.id.toString()}
                  message={msg}
                  currentUserId={currentUserId}
                  memberCount={memberCount}
                  isGroup={!!isGroup}
                  showSender={showSender}
                  onImageClick={setLightboxUrl}
                  index={idx}
                />
              );
            })
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Upload progress */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="px-4 py-2 bg-muted/50 shrink-0"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-muted-foreground">
                Uploading... {uploadProgress}%
              </span>
            </div>
            <Progress value={uploadProgress} className="h-1" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media preview */}
      <AnimatePresence>
        {pendingFile && pendingFilePreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-2 border-t border-border bg-muted/30 shrink-0"
          >
            <div className="relative inline-block">
              {pendingFile.type.startsWith("image/") ? (
                <img
                  src={pendingFilePreview}
                  alt="Selected file preview"
                  className="h-20 w-auto rounded-lg object-cover"
                />
              ) : pendingFile.type.startsWith("video/") ? (
                <div className="flex items-center gap-2 bg-card rounded-lg px-3 py-2">
                  <Video className="h-5 w-5 text-primary" />
                  <span className="text-sm text-foreground truncate max-w-[200px]">
                    {pendingFile.name}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-card rounded-lg px-3 py-2">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  <span className="text-sm text-foreground truncate max-w-[200px]">
                    {pendingFile.name}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={clearPendingFile}
                className="absolute -top-2 -right-2 w-5 h-5 bg-destructive rounded-full flex items-center justify-center"
                aria-label="Remove attached file"
              >
                <X className="h-3 w-3 text-destructive-foreground" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div
        className="px-4 py-3 border-t border-border bg-sidebar shrink-0"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <AnimatePresence mode="wait">
          {isRecording ? (
            <motion.div
              key="recording"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-3"
            >
              {/* Cancel */}
              <Button
                data-ocid="chat.cancel_button"
                size="icon"
                variant="ghost"
                onClick={cancelRecording}
                className="h-10 w-10 rounded-xl hover:bg-muted shrink-0"
                aria-label="Cancel recording"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </Button>

              {/* Recording indicator */}
              <div className="flex-1 flex items-center gap-2 bg-muted/30 rounded-xl px-3 h-10">
                <div
                  className="w-2.5 h-2.5 rounded-full animate-pulse shrink-0"
                  style={{ background: "oklch(0.65 0.22 25)" }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: "oklch(0.65 0.22 25)" }}
                >
                  Recording
                </span>
                <span className="text-sm text-muted-foreground ml-1">
                  {formatRecordingTime(recordingSeconds)}
                </span>
              </div>

              {/* Send recording */}
              <Button
                data-ocid="chat.send_button"
                size="icon"
                onClick={sendRecording}
                disabled={isUploading || sending}
                className="h-10 w-10 rounded-xl shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.76 0.13 72), oklch(0.65 0.11 65))",
                  color: "oklch(0.08 0.004 55)",
                }}
                aria-label="Send voice message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*,audio/*"
                onChange={handleFileChange}
                className="hidden"
                data-ocid="chat.upload_button"
              />
              <Button
                data-ocid="chat.attach_button"
                size="icon"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || sending}
                className="h-10 w-10 rounded-xl hover:bg-muted shrink-0"
              >
                <Paperclip className="h-5 w-5 text-muted-foreground" />
              </Button>

              <Input
                data-ocid="chat.message_input"
                placeholder="Message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isUploading || sending}
                className="flex-1 bg-input border-border h-10 rounded-xl"
                autoComplete="off"
                autoCorrect="on"
                autoCapitalize="sentences"
                enterKeyHint="send"
              />

              {/* Mic button — click to start recording */}
              {!text.trim() && !pendingFile && (
                <Button
                  data-ocid="chat.toggle"
                  size="icon"
                  variant="ghost"
                  onClick={startRecording}
                  disabled={isUploading || sending}
                  className="h-10 w-10 rounded-xl hover:bg-muted shrink-0 transition-colors"
                  aria-label="Start voice recording"
                >
                  <Mic className="h-5 w-5" />
                </Button>
              )}

              {(text.trim() || pendingFile) && (
                <Button
                  data-ocid="chat.send_button"
                  size="icon"
                  onClick={handleSend}
                  disabled={
                    (!text.trim() && !pendingFile) || isUploading || sending
                  }
                  className="h-10 w-10 rounded-xl shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.76 0.13 72), oklch(0.65 0.11 65))",
                    color: "oklch(0.08 0.004 55)",
                  }}
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/90 flex items-center justify-center"
          >
            <button
              type="button"
              className="absolute inset-0 w-full h-full cursor-default"
              onClick={() => setLightboxUrl(null)}
              aria-label="Close image viewer"
            />
            <button
              type="button"
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-muted hover:bg-muted/80"
              onClick={() => setLightboxUrl(null)}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={lightboxUrl}
              alt="Full size view"
              className="relative z-10 max-w-[90vw] max-h-[90vh] object-contain rounded-xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile modal (fallback if no onOpenUserProfile) */}
      {!onOpenUserProfile && (
        <UserProfileModal
          userId={otherUserId}
          open={profileModalOpen}
          onOpenChange={setProfileModalOpen}
          onStartChat={() => {}}
        />
      )}
    </div>
  );
}
