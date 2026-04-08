import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Bookmark,
  Check,
  Copy,
  Loader2,
  MessageCircle,
  Play,
  QrCode,
  Radio,
  Share2,
  Shield,
  ShieldOff,
  Star,
  StarOff,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Status, UserProfile } from "../backend";
import {
  useBlockUser,
  useFollowChannel,
  useGetAllChannels,
  useGetHighlightedStatuses,
  useGetMyBlockedUsers,
  useGetMyBookmarkedPosts,
  useGetMyHighlights,
  useGetMyStatuses,
  useGetStatusInteractions,
  useGetUserProfile,
  useIsUserOnline,
  useRemoveHighlight,
  useSaveHighlight,
  useUnblockUser,
  useUnfollowChannel,
} from "../hooks/useQueries";
import type { ChannelId } from "../hooks/useQueries";
import ChannelPostCard from "./ChannelPostCard";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatLastSeen(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  if (ms === 0) return "";
  const now = Date.now();
  const diff = now - ms;
  if (diff < 60000) return "Last seen just now";
  if (diff < 3600000) return `Last seen ${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `Last seen ${Math.floor(diff / 3600000)}h ago`;
  return `Last seen ${new Date(ms).toLocaleDateString()}`;
}

/** Build a QR code image URL using the public api.qrserver.com service */
function buildQrUrl(data: string, size = 160): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&bgcolor=C8A84B&color=1A1208&margin=4`;
}

function ChannelFollowCard({
  channelId,
  name,
  avatarUrl,
  description,
  followerCount,
  isFollowing,
  isOwner,
  index,
}: {
  channelId: ChannelId;
  name: string;
  avatarUrl?: string;
  description?: string;
  followerCount: number;
  isFollowing: boolean;
  isOwner: boolean;
  index: number;
}) {
  const { mutate: follow, isPending: following } = useFollowChannel();
  const { mutate: unfollow, isPending: unfollowing } = useUnfollowChannel();
  const ocid = index + 1;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFollowing) {
      unfollow(channelId);
    } else {
      follow(channelId);
    }
  };

  return (
    <div
      data-ocid={`profile.channels.item.${ocid}`}
      className="flex items-center gap-3 px-4 py-2.5 border-b border-border/30 last:border-0"
    >
      <Avatar className="w-10 h-10 shrink-0">
        {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
        <AvatarFallback
          className="text-sm font-bold"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.76 0.13 72 / 0.25), oklch(0.65 0.11 65 / 0.15))",
            color: "oklch(0.82 0.15 72)",
            border: "1.5px solid oklch(0.76 0.13 72 / 0.3)",
          }}
        >
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-xs text-foreground truncate">{name}</p>
        {description && (
          <p className="text-[11px] text-muted-foreground truncate">
            {description}
          </p>
        )}
        <div className="flex items-center gap-1 mt-0.5 text-muted-foreground/60">
          <Users className="h-2.5 w-2.5" />
          <span className="text-[10px]">{followerCount}</span>
        </div>
      </div>

      {!isOwner && (
        <button
          type="button"
          data-ocid={`profile.channels.toggle.${ocid}`}
          onClick={handleToggle}
          disabled={following || unfollowing}
          className="shrink-0 text-[11px] px-2.5 py-1 rounded-full border transition-colors"
          style={{
            background: isFollowing ? "transparent" : "oklch(0.82 0.15 72)",
            color: isFollowing ? "oklch(0.6 0.05 55)" : "oklch(0.08 0.004 55)",
            borderColor: isFollowing
              ? "oklch(0.3 0.01 55)"
              : "oklch(0.82 0.15 72)",
          }}
        >
          {following || unfollowing ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : isFollowing ? (
            "Following"
          ) : (
            "Follow"
          )}
        </button>
      )}
    </div>
  );
}

interface UserProfileModalProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartChat: (userId: string) => void;
  currentUserId?: string;
}

/** Inline story viewer for highlighted stories — full-screen overlay */
function HighlightViewer({
  statuses,
  initialIndex,
  onClose,
}: {
  statuses: Status[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const videoRef = useRef<HTMLVideoElement>(null);
  const status = statuses[index];
  const { data: interactions } = useGetStatusInteractions(status?.id ?? null);

  if (!status) return null;
  const mediaKind = status.content.mediaType?.__kind__;
  const isVideo = mediaKind === "video";

  const goNext = () => {
    if (index < statuses.length - 1) setIndex(index + 1);
    else onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex flex-col"
      style={{ background: "oklch(0.05 0.005 55)" }}
    >
      {/* Progress bars */}
      <div className="flex gap-1 px-4 pt-3 pb-1">
        {statuses.map((_, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: index is stable
            key={i}
            className="flex-1 h-0.5 rounded-full"
            style={{
              background:
                i <= index ? "oklch(0.82 0.15 72)" : "oklch(0.4 0.005 55)",
            }}
          />
        ))}
      </div>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2">
        <div className="flex-1">
          <p className="text-xs" style={{ color: "oklch(0.65 0.05 72)" }}>
            Highlight {index + 1} of {statuses.length}
          </p>
        </div>
        <p className="text-xs text-white/50">
          {Number(interactions?.likeCount ?? 0)} likes
        </p>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="h-9 w-9 rounded-full text-white hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      {/* Content */}
      <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden">
        {index > 0 && (
          <button
            type="button"
            className="absolute left-0 top-0 w-1/4 h-full z-10"
            onClick={() => setIndex(index - 1)}
            aria-label="Previous"
          />
        )}
        <button
          type="button"
          className="absolute right-0 top-0 w-1/4 h-full z-10"
          onClick={goNext}
          aria-label="Next"
        />
        {status.content.mediaUrl && mediaKind === "image" && (
          <img
            src={status.content.mediaUrl}
            alt="Highlight"
            className="max-w-full max-h-[70vh] object-contain rounded-xl relative z-20"
          />
        )}
        {status.content.mediaUrl && isVideo && (
          // biome-ignore lint/a11y/useMediaCaption: user-uploaded content
          <video
            ref={videoRef}
            key={String(status.id)}
            src={status.content.mediaUrl}
            autoPlay
            muted
            loop
            playsInline
            controls
            className="max-w-full max-h-[70vh] object-contain rounded-xl relative z-20"
          />
        )}
        {status.content.text && (
          <div
            className="px-8 py-6 rounded-2xl text-center text-white text-xl font-semibold max-w-sm relative z-20"
            style={{
              background: status.content.mediaUrl
                ? "oklch(0.0 0 0 / 0.5)"
                : "linear-gradient(135deg, oklch(0.25 0.04 72), oklch(0.18 0.03 65))",
            }}
          >
            {status.content.text}
          </div>
        )}
        {!isVideo && (
          <button
            type="button"
            className="absolute inset-0 z-0"
            onClick={goNext}
            aria-label="Next"
          />
        )}
      </div>
    </motion.div>
  );
}

export default function UserProfileModal({
  userId,
  open,
  onOpenChange,
  onStartChat,
  currentUserId,
}: UserProfileModalProps) {
  const { data: profile, isLoading } = useGetUserProfile(userId);
  const { data: isOnline } = useIsUserOnline(userId);
  const { data: allChannels = [] } = useGetAllChannels();
  const { data: blockedUsers = [] } = useGetMyBlockedUsers();
  const { mutate: blockUser, isPending: blocking } = useBlockUser();
  const { mutate: unblockUser, isPending: unblocking } = useUnblockUser();
  const isBlocked = profile
    ? blockedUsers.some((u) => u.username === profile.username)
    : false;
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  // Highlight viewer state
  const [highlightViewerIndex, setHighlightViewerIndex] = useState<
    number | null
  >(null);

  // Is the viewer looking at their own profile?
  const isOwnProfile = !!userId && !!currentUserId && userId === currentUserId;

  // Bookmarked posts — only fetched when viewing own profile
  const { data: bookmarkedPosts = [] } = useGetMyBookmarkedPosts();

  // Highlights — fetch for the profile being viewed
  const { data: highlightedStatuses = [] } = useGetHighlightedStatuses(userId);
  // Own highlight IDs (to show save/remove button on own stories)
  const { data: myHighlightIds = [] } = useGetMyHighlights();
  // Own stories (for save-as-highlight on own profile)
  const { data: myStatuses = [] } = useGetMyStatuses();
  const saveHighlight = useSaveHighlight();
  const removeHighlight = useRemoveHighlight();

  // Channels owned by this user
  const userChannels = userId
    ? allChannels.filter((m) => m.channel.owner.toString() === userId)
    : [];

  const profileUrl = profile
    ? `${window.location.origin}/profile/${encodeURIComponent(profile.username)}`
    : null;

  const handleCopy = async () => {
    if (!profileUrl) return;
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success("Profile link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleShare = async () => {
    if (!profileUrl || !profile) return;
    try {
      await navigator.share({
        title: `${profile.displayName} on Pulse`,
        text: `Chat with @${profile.username} on Pulse`,
        url: profileUrl,
      });
    } catch {
      // user cancelled or not supported
    }
  };

  // Reset QR when modal closes
  const handleOpenChange = (val: boolean) => {
    if (!val) setShowQr(false);
    onOpenChange(val);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        data-ocid="profile.sheet"
        side="right"
        className="w-full sm:w-80 bg-sidebar border-border p-0 flex flex-col"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-foreground font-display text-lg">
              Profile
            </SheetTitle>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              className="h-8 w-8 rounded-xl"
              data-ocid="profile.close_button"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div
              data-ocid="profile.loading_state"
              className="flex flex-col items-center justify-center py-16 gap-3"
            >
              <div
                className="w-20 h-20 rounded-full animate-pulse"
                style={{ background: "oklch(0.76 0.13 72 / 0.15)" }}
              />
              <div
                className="h-4 w-32 rounded animate-pulse"
                style={{ background: "oklch(0.76 0.13 72 / 0.15)" }}
              />
            </div>
          ) : !profile ? (
            <div
              data-ocid="profile.error_state"
              className="flex flex-col items-center justify-center py-16 text-center px-6"
            >
              <p className="text-muted-foreground text-sm">Profile not found</p>
            </div>
          ) : (
            <div className="flex flex-col items-center px-6 py-8 gap-4">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="w-24 h-24">
                  {profile.avatarUrl && (
                    <AvatarImage
                      src={profile.avatarUrl}
                      alt={profile.displayName}
                    />
                  )}
                  <AvatarFallback
                    className="text-2xl font-semibold"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.76 0.13 72 / 0.4), oklch(0.65 0.11 65 / 0.3))",
                      color: "oklch(0.82 0.15 72)",
                      border: "2px solid oklch(0.76 0.13 72 / 0.4)",
                    }}
                  >
                    {getInitials(profile.displayName)}
                  </AvatarFallback>
                </Avatar>
                {/* Online dot */}
                <div
                  className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-sidebar"
                  style={{
                    background: isOnline
                      ? "oklch(0.72 0.20 140)"
                      : "oklch(0.45 0.01 70)",
                    boxShadow: isOnline
                      ? "0 0 8px oklch(0.72 0.20 140 / 0.6)"
                      : "none",
                  }}
                />
              </div>

              {/* Name & username */}
              <div className="text-center">
                <h3 className="font-display text-xl font-bold text-foreground">
                  {profile.displayName}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  @{profile.username}
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: "oklch(0.72 0.20 140)" }}
                >
                  {isOnline ? "● Online" : formatLastSeen(profile.lastSeen)}
                </p>
              </div>

              {/* Bio */}
              {profile.bio && (
                <div
                  className="w-full rounded-xl p-4 text-sm text-foreground/80 leading-relaxed text-center"
                  style={{ background: "oklch(0.12 0.005 55)" }}
                >
                  {profile.bio}
                </div>
              )}

              {/* Message button */}
              {userId && (
                <>
                  <Button
                    data-ocid="profile.primary_button"
                    className="w-full h-11 rounded-xl font-semibold mt-2"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.76 0.13 72), oklch(0.65 0.11 65))",
                      color: "oklch(0.08 0.004 55)",
                    }}
                    onClick={() => {
                      onStartChat(userId);
                      handleOpenChange(false);
                    }}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Button
                    data-ocid={
                      isBlocked
                        ? "profile.unblock_button"
                        : "profile.block_button"
                    }
                    variant="outline"
                    className="w-full h-9 rounded-xl font-medium text-sm"
                    disabled={blocking || unblocking}
                    style={{
                      borderColor: isBlocked
                        ? "oklch(0.76 0.13 72 / 0.4)"
                        : "oklch(0.35 0.02 55)",
                      color: isBlocked
                        ? "oklch(0.76 0.13 72)"
                        : "oklch(0.6 0.05 55)",
                      background: "transparent",
                    }}
                    onClick={() => {
                      if (isBlocked) {
                        unblockUser(userId);
                      } else {
                        blockUser(userId);
                      }
                    }}
                  >
                    {blocking || unblocking ? (
                      <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                    ) : isBlocked ? (
                      <ShieldOff className="h-3.5 w-3.5 mr-2" />
                    ) : (
                      <Shield className="h-3.5 w-3.5 mr-2" />
                    )}
                    {isBlocked ? "Unblock User" : "Block User"}
                  </Button>
                </>
              )}

              {/* Channels section */}
              {userChannels.length > 0 && (
                <div className="w-full">
                  <div className="flex items-center gap-2 mb-2">
                    <Radio
                      className="h-3.5 w-3.5"
                      style={{ color: "oklch(0.82 0.15 72 / 0.7)" }}
                    />
                    <span
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "oklch(0.82 0.15 72 / 0.7)" }}
                    >
                      Channels
                    </span>
                  </div>
                  <div
                    className="rounded-xl overflow-hidden"
                    style={{ background: "oklch(0.12 0.005 55)" }}
                  >
                    {userChannels.map((meta, idx) => (
                      <ChannelFollowCard
                        key={meta.channel.id.toString()}
                        channelId={meta.channel.id}
                        name={meta.channel.name}
                        avatarUrl={meta.channel.avatarUrl || undefined}
                        description={meta.channel.description || undefined}
                        followerCount={Number(meta.followerCount)}
                        isFollowing={meta.isFollowing}
                        isOwner={meta.channel.owner.toString() === userId}
                        index={idx}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Highlights section — visible to all profile visitors */}
              {(highlightedStatuses.length > 0 || isOwnProfile) && (
                <div className="w-full" data-ocid="profile.highlights.section">
                  <div className="flex items-center gap-2 mb-2">
                    <Star
                      className="h-3.5 w-3.5"
                      style={{ color: "oklch(0.82 0.15 72 / 0.7)" }}
                    />
                    <span
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "oklch(0.82 0.15 72 / 0.7)" }}
                    >
                      Highlights
                    </span>
                    {isOwnProfile && highlightedStatuses.length > 0 && (
                      <span
                        className="text-xs ml-auto"
                        style={{ color: "oklch(0.5 0.03 55)" }}
                      >
                        {highlightedStatuses.length}
                      </span>
                    )}
                  </div>

                  {highlightedStatuses.length === 0 && isOwnProfile ? (
                    <div
                      className="rounded-xl py-5 flex flex-col items-center justify-center text-center"
                      style={{
                        background: "oklch(0.12 0.005 55)",
                        border: "1px dashed oklch(0.82 0.15 72 / 0.15)",
                      }}
                      data-ocid="profile.highlights.empty_state"
                    >
                      <Star
                        className="h-5 w-5 mb-1.5 opacity-30"
                        style={{ color: "oklch(0.82 0.15 72)" }}
                      />
                      <p className="text-xs text-muted-foreground">
                        No highlights yet
                      </p>
                      <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                        Save your stories to keep them permanently
                      </p>
                    </div>
                  ) : (
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                      {highlightedStatuses.map((status, idx) => {
                        const isHighlighted = myHighlightIds.some(
                          (id) => id.toString() === status.id.toString(),
                        );
                        const mediaKind = status.content.mediaType?.__kind__;
                        return (
                          <div
                            key={status.id.toString()}
                            className="relative shrink-0 group"
                          >
                            <button
                              type="button"
                              data-ocid={`profile.highlights.item.${idx + 1}`}
                              onClick={() => setHighlightViewerIndex(idx)}
                              className="w-16 h-16 rounded-xl overflow-hidden border-2 flex items-center justify-center relative"
                              style={{
                                borderColor: "oklch(0.82 0.15 72 / 0.5)",
                                background: "oklch(0.12 0.005 55)",
                              }}
                            >
                              {status.content.mediaUrl &&
                              mediaKind === "image" ? (
                                <img
                                  src={status.content.mediaUrl}
                                  alt="Highlight"
                                  className="w-full h-full object-cover"
                                />
                              ) : status.content.mediaUrl &&
                                mediaKind === "video" ? (
                                <div className="w-full h-full flex items-center justify-center bg-black/50">
                                  <Play
                                    className="h-5 w-5 text-white"
                                    fill="white"
                                  />
                                </div>
                              ) : (
                                <Star
                                  className="h-6 w-6 opacity-40"
                                  style={{ color: "oklch(0.82 0.15 72)" }}
                                />
                              )}
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Play
                                  className="h-4 w-4 text-white"
                                  fill="white"
                                />
                              </div>
                            </button>
                            {/* Remove highlight button on own profile */}
                            {isOwnProfile && isHighlighted && (
                              <button
                                type="button"
                                data-ocid={`profile.highlights.remove.${idx + 1}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeHighlight.mutate(status.id, {
                                    onSuccess: () =>
                                      toast.success("Removed from highlights"),
                                    onError: () =>
                                      toast.error("Failed to remove highlight"),
                                  });
                                }}
                                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ background: "oklch(0.35 0.15 25)" }}
                                aria-label="Remove highlight"
                              >
                                <X className="h-2.5 w-2.5 text-white" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Save stories as highlights — own profile only */}
                  {isOwnProfile && myStatuses.length > 0 && (
                    <div className="mt-2">
                      <p
                        className="text-[11px] mb-1.5"
                        style={{ color: "oklch(0.5 0.03 55)" }}
                      >
                        Save stories as highlights:
                      </p>
                      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                        {myStatuses.map((status, idx) => {
                          const isAlreadyHighlighted = myHighlightIds.some(
                            (id) => id.toString() === status.id.toString(),
                          );
                          const mediaKind = status.content.mediaType?.__kind__;
                          return (
                            <div
                              key={status.id.toString()}
                              className="shrink-0 relative"
                            >
                              <button
                                type="button"
                                data-ocid={`profile.highlights.save.${idx + 1}`}
                                disabled={
                                  isAlreadyHighlighted ||
                                  saveHighlight.isPending
                                }
                                onClick={() => {
                                  if (isAlreadyHighlighted) return;
                                  saveHighlight.mutate(status.id, {
                                    onSuccess: () =>
                                      toast.success("Saved to highlights!"),
                                    onError: () =>
                                      toast.error("Failed to save highlight"),
                                  });
                                }}
                                className="w-12 h-12 rounded-lg overflow-hidden border-2 flex items-center justify-center relative opacity-100 disabled:opacity-50"
                                style={{
                                  borderColor: isAlreadyHighlighted
                                    ? "oklch(0.82 0.15 72)"
                                    : "oklch(0.3 0.01 55)",
                                  background: "oklch(0.12 0.005 55)",
                                }}
                              >
                                {status.content.mediaUrl &&
                                mediaKind === "image" ? (
                                  <img
                                    src={status.content.mediaUrl}
                                    alt="Story"
                                    className="w-full h-full object-cover"
                                  />
                                ) : status.content.mediaUrl &&
                                  mediaKind === "video" ? (
                                  <Play
                                    className="h-4 w-4"
                                    style={{ color: "oklch(0.82 0.15 72)" }}
                                  />
                                ) : (
                                  <Star
                                    className="h-4 w-4 opacity-40"
                                    style={{ color: "oklch(0.82 0.15 72)" }}
                                  />
                                )}
                                {isAlreadyHighlighted && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                    <StarOff className="h-3.5 w-3.5 text-white" />
                                  </div>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Bookmarks section — only shown on own profile */}
              {isOwnProfile && (
                <div className="w-full" data-ocid="profile.bookmarks.section">
                  <div className="flex items-center gap-2 mb-2">
                    <Bookmark
                      className="h-3.5 w-3.5"
                      style={{ color: "oklch(0.82 0.15 72 / 0.7)" }}
                    />
                    <span
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "oklch(0.82 0.15 72 / 0.7)" }}
                    >
                      Bookmarks
                    </span>
                    <span
                      className="text-xs ml-auto"
                      style={{ color: "oklch(0.5 0.03 55)" }}
                    >
                      {bookmarkedPosts.length}
                    </span>
                  </div>
                  {bookmarkedPosts.length === 0 ? (
                    <div
                      className="rounded-xl py-6 flex flex-col items-center justify-center text-center"
                      style={{
                        background: "oklch(0.12 0.005 55)",
                        border: "1px dashed oklch(0.82 0.15 72 / 0.15)",
                      }}
                      data-ocid="profile.bookmarks.empty_state"
                    >
                      <Bookmark
                        className="h-6 w-6 mb-2 opacity-30"
                        style={{ color: "oklch(0.82 0.15 72)" }}
                      />
                      <p className="text-xs text-muted-foreground">
                        No bookmarks yet
                      </p>
                      <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                        Tap the bookmark icon on any channel post
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {bookmarkedPosts.map((post, idx) => {
                        const channelMeta = allChannels.find(
                          (m) =>
                            m.channel.id.toString() ===
                            post.channelId.toString(),
                        );
                        const resolvedAuthorName =
                          channelMeta?.ownerProfile.displayName ??
                          channelMeta?.ownerProfile.username ??
                          "Unknown";
                        const resolvedAuthorAvatar =
                          channelMeta?.ownerProfile.avatarUrl ?? undefined;
                        return (
                          <ChannelPostCard
                            key={post.id.toString()}
                            post={post}
                            authorName={resolvedAuthorName}
                            authorAvatar={resolvedAuthorAvatar}
                            isOwner={false}
                            isPostAuthor={
                              post.author.toText() === currentUserId
                            }
                            currentUserId={currentUserId ?? ""}
                            channelId={post.channelId}
                            index={idx}
                            isBookmarked={true}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Profile link section */}
              {profileUrl && (
                <div className="w-full">
                  <div
                    className="rounded-xl p-3 flex flex-col gap-2"
                    style={{ background: "oklch(0.12 0.005 55)" }}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className="text-xs truncate flex-1"
                        style={{ color: "oklch(0.65 0.08 72)" }}
                      >
                        {profileUrl}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          data-ocid="profile.secondary_button"
                          size="icon"
                          variant="ghost"
                          onClick={handleCopy}
                          className="h-7 w-7 rounded-lg"
                          title="Copy profile link"
                          style={{ color: "oklch(0.76 0.13 72)" }}
                        >
                          {copied ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        {typeof navigator !== "undefined" &&
                          "share" in navigator && (
                            <Button
                              data-ocid="profile.share_button"
                              size="icon"
                              variant="ghost"
                              onClick={handleShare}
                              className="h-7 w-7 rounded-lg"
                              title="Share profile"
                              style={{ color: "oklch(0.76 0.13 72)" }}
                            >
                              <Share2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        <Button
                          data-ocid="profile.qr_toggle"
                          size="icon"
                          variant="ghost"
                          onClick={() => setShowQr((v) => !v)}
                          className="h-7 w-7 rounded-lg"
                          title="Show QR code"
                          style={{
                            color: showQr
                              ? "oklch(0.08 0.004 55)"
                              : "oklch(0.76 0.13 72)",
                            background: showQr
                              ? "oklch(0.76 0.13 72)"
                              : "transparent",
                          }}
                        >
                          <QrCode className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* QR Code — generated via qrserver.com, no library needed */}
                    {showQr && (
                      <div
                        className="flex flex-col items-center gap-2 pt-2 pb-1"
                        data-ocid="profile.panel"
                      >
                        <div
                          className="rounded-xl p-3"
                          style={{
                            background: "oklch(0.76 0.13 72)",
                            boxShadow: "0 0 20px oklch(0.76 0.13 72 / 0.3)",
                          }}
                        >
                          <img
                            src={buildQrUrl(profileUrl)}
                            alt={`QR code for @${profile.username}`}
                            className="w-40 h-40 rounded-lg"
                            loading="lazy"
                          />
                        </div>
                        <p
                          className="text-xs text-center"
                          style={{ color: "oklch(0.55 0.06 70)" }}
                        >
                          Scan to visit @{profile.username}&apos;s profile
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>

      {/* Highlight story viewer — full-screen overlay */}
      <AnimatePresence>
        {highlightViewerIndex !== null && highlightedStatuses.length > 0 && (
          <HighlightViewer
            statuses={highlightedStatuses}
            initialIndex={highlightViewerIndex}
            onClose={() => setHighlightViewerIndex(null)}
          />
        )}
      </AnimatePresence>
    </Sheet>
  );
}
