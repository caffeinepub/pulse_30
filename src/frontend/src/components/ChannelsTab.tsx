import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Plus, Radio, Search, Users } from "lucide-react";
import { useState } from "react";
import {
  useFollowChannel,
  useGetAllChannels,
  useUnfollowChannel,
} from "../hooks/useQueries";
import type { ChannelId, ChannelWithMeta } from "../hooks/useQueries";
import CreateChannelModal from "./CreateChannelModal";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function ChannelCard({
  meta,
  currentUserId,
  onSelect,
  index,
}: {
  meta: ChannelWithMeta;
  currentUserId: string;
  onSelect: (id: ChannelId) => void;
  index: number;
}) {
  const { channel, followerCount, isFollowing } = meta;
  const { mutate: follow, isPending: following } = useFollowChannel();
  const { mutate: unfollow, isPending: unfollowing } = useUnfollowChannel();
  const isOwner = channel.owner.toString() === currentUserId;
  const ocid = index + 1;

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFollowing) {
      unfollow(channel.id);
    } else {
      follow(channel.id);
    }
  };

  return (
    <button
      type="button"
      data-ocid={`channels.item.${ocid}`}
      onClick={() => onSelect(channel.id)}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors text-left border-b border-border/30 last:border-0"
    >
      <Avatar className="w-12 h-12 shrink-0">
        {channel.avatarUrl && (
          <AvatarImage src={channel.avatarUrl} alt={channel.name} />
        )}
        <AvatarFallback
          className="text-base font-bold"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.76 0.13 72 / 0.25), oklch(0.65 0.11 65 / 0.15))",
            color: "oklch(0.82 0.15 72)",
            border: "1.5px solid oklch(0.76 0.13 72 / 0.3)",
          }}
        >
          {getInitials(channel.name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="font-semibold text-sm text-foreground truncate">
            {channel.name}
          </span>
          {isOwner && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full shrink-0"
              style={{
                background: "oklch(0.76 0.13 72 / 0.2)",
                color: "oklch(0.82 0.15 72)",
              }}
            >
              Owner
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {channel.description || "No description"}
        </p>
        <div className="flex items-center gap-1 mt-1 text-muted-foreground/60">
          <Users className="h-3 w-3" />
          <span className="text-[11px]">{Number(followerCount)}</span>
        </div>
      </div>

      {!isOwner && (
        <button
          type="button"
          data-ocid={`channels.toggle.${ocid}`}
          onClick={handleFollowClick}
          disabled={following || unfollowing}
          className="shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors"
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
    </button>
  );
}

interface ChannelsTabProps {
  currentUserId: string;
  onSelectChannel: (id: ChannelId) => void;
}

export default function ChannelsTab({
  currentUserId,
  onSelectChannel,
}: ChannelsTabProps) {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const { data: channels = [], isLoading } = useGetAllChannels();

  const filtered = channels.filter((c) => {
    if (!search.trim()) return true;
    return c.channel.name.toLowerCase().includes(search.toLowerCase());
  });

  const handleCreated = (channelId: bigint) => {
    onSelectChannel(channelId as ChannelId);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-3 pb-3 border-b border-border shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Radio
              className="h-4 w-4"
              style={{ color: "oklch(0.82 0.15 72)" }}
            />
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "oklch(0.82 0.15 72 / 0.8)" }}
            >
              Channels
            </span>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setCreateOpen(true)}
            className="h-8 w-8 rounded-xl hover:bg-muted"
            data-ocid="channels.open_modal_button"
            aria-label="Create channel"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            data-ocid="channels.search_input"
            placeholder="Search channels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-input border-border h-8 text-sm"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {isLoading ? (
          <div
            data-ocid="channels.loading_state"
            className="flex flex-col gap-1 p-2"
          >
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-28 mb-2" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            data-ocid="channels.empty_state"
            className="flex flex-col items-center justify-center py-16 px-6 text-center"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 opacity-30"
              style={{ background: "oklch(0.76 0.13 72 / 0.2)" }}
            >
              <Radio
                className="h-7 w-7"
                style={{ color: "oklch(0.82 0.15 72)" }}
              />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {search ? "No channels found" : "No channels yet"}
            </p>
            {!search && (
              <p className="text-xs text-muted-foreground/60 mt-1">
                Tap + to create the first one
              </p>
            )}
          </div>
        ) : (
          <div data-ocid="channels.list">
            {filtered.map((meta, idx) => (
              <ChannelCard
                key={meta.channel.id.toString()}
                meta={meta}
                currentUserId={currentUserId}
                onSelect={onSelectChannel}
                index={idx}
              />
            ))}
          </div>
        )}
      </div>

      <CreateChannelModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleCreated}
      />
    </div>
  );
}
