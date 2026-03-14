import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LogOut,
  MessageCircle,
  MoreVertical,
  Pencil,
  Plus,
  Radio,
  Search,
} from "lucide-react";
import { useCallback, useState } from "react";
import type { Conversation, ConversationId, UserProfile } from "../backend";
import {
  useGetUserProfile,
  useListUserConversations,
} from "../hooks/useQueries";
import type { ChannelId } from "../hooks/useQueries";
import ChannelsTab from "./ChannelsTab";
import EditProfileModal from "./EditProfileModal";
import NewChatModal from "./NewChatModal";
import StatusView from "./StatusView";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  if (ms === 0) return "";
  const now = Date.now();
  const diff = now - ms;
  if (diff < 60000) return "now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
  const date = new Date(ms);
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

interface ConversationItemProps {
  conversation: Conversation;
  currentUserId: string;
  isActive: boolean;
  onClick: () => void;
  index: number;
}

function ConversationItem({
  conversation,
  currentUserId,
  isActive,
  onClick,
  index,
}: ConversationItemProps) {
  const isGroup = conversation.type.__kind__ === "group";
  const otherUserId = isGroup
    ? null
    : (conversation.members
        .find((m) => m.toString() !== currentUserId)
        ?.toString() ?? null);

  const { data: otherProfile } = useGetUserProfile(otherUserId);

  const name = isGroup
    ? (conversation.type as { __kind__: "group"; group: string }).group
    : (otherProfile?.displayName ?? otherUserId?.slice(0, 8) ?? "Unknown");

  const messages = conversation.messages;
  const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
  const lastText = lastMsg?.content.mediaUrl
    ? lastMsg.content.mediaType?.__kind__ === "image"
      ? "📷 Photo"
      : lastMsg.content.mediaType?.__kind__ === "video"
        ? "🎥 Video"
        : lastMsg.content.mediaType?.__kind__ === "audio"
          ? "🎤 Voice message"
          : "📎 Media"
    : (lastMsg?.content.text ?? "");

  const unreadCount = messages.filter(
    (m) =>
      m.sender.toString() !== currentUserId &&
      !m.readReceipts.some((r) => r.userId.toString() === currentUserId),
  ).length;

  const ocidIndex = index + 1;

  return (
    <button
      type="button"
      data-ocid={`sidebar.conversation_item.${ocidIndex}`}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left ${
        isActive ? "bg-muted/70 border-r-2 border-primary" : ""
      }`}
    >
      <Avatar className="w-11 h-11 shrink-0">
        {otherProfile?.avatarUrl && (
          <AvatarImage src={otherProfile.avatarUrl} alt={name} />
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
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span
            className={`font-medium text-sm truncate ${
              unreadCount > 0 ? "text-foreground" : "text-foreground/80"
            }`}
          >
            {name}
          </span>
          <span className="text-xs text-muted-foreground shrink-0 ml-2">
            {formatTimestamp(conversation.lastMessageTimestamp)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground truncate flex-1">
            {lastText || "No messages yet"}
          </p>
          {unreadCount > 0 && (
            <Badge
              className="ml-2 min-w-[20px] h-5 flex items-center justify-center text-xs shrink-0 px-1.5"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.76 0.13 72), oklch(0.65 0.11 65))",
                color: "oklch(0.08 0.004 55)",
              }}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}

interface SidebarProps {
  currentUserId: string;
  currentProfile: UserProfile | null;
  activeConversationId: ConversationId | null;
  onSelectConversation: (id: ConversationId) => void;
  onSelectChannel: (id: ChannelId) => void;
  onStartChat: (userId: string) => void;
  onLogout: () => void;
}

export default function Sidebar({
  currentUserId,
  currentProfile,
  activeConversationId,
  onSelectConversation,
  onSelectChannel,
  onStartChat,
  onLogout,
}: SidebarProps) {
  const [search, setSearch] = useState("");
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chats");
  const { data: conversations, isLoading } = useListUserConversations();

  const filteredConversations = useCallback(() => {
    if (!conversations) return [];
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter((c) => {
      if (c.type.__kind__ === "group") {
        return (c.type as { __kind__: "group"; group: string }).group
          .toLowerCase()
          .includes(q);
      }
      return true;
    });
  }, [conversations, search])();

  const handleConversationCreated = (id: ConversationId) => {
    setNewChatOpen(false);
    onSelectConversation(id);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-border shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="font-display text-2xl font-bold gold-shimmer">
              Pulse
            </span>
          </div>
          <div className="flex items-center gap-1">
            {activeTab === "chats" && (
              <Button
                data-ocid="sidebar.new_chat_button"
                size="icon"
                variant="ghost"
                onClick={() => setNewChatOpen(true)}
                className="h-9 w-9 rounded-xl hover:bg-muted"
                aria-label="New chat"
              >
                <Plus className="h-5 w-5" />
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 rounded-xl hover:bg-muted"
                  aria-label="More options"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-popover border-border"
              >
                <DropdownMenuItem
                  onClick={onLogout}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Profile chip */}
        {currentProfile && (
          <div className="flex items-center gap-2 mb-3">
            <Avatar className="w-7 h-7">
              {currentProfile.avatarUrl && (
                <AvatarImage
                  src={currentProfile.avatarUrl}
                  alt={currentProfile.displayName}
                />
              )}
              <AvatarFallback
                className="text-xs font-semibold"
                style={{
                  background: "oklch(0.76 0.13 72 / 0.2)",
                  color: "oklch(0.82 0.15 72)",
                }}
              >
                {getInitials(currentProfile.displayName)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground flex-1 truncate">
              {currentProfile.displayName}
            </span>
            <Button
              data-ocid="sidebar.edit_profile_button"
              size="icon"
              variant="ghost"
              onClick={() => setEditProfileOpen(true)}
              className="h-7 w-7 rounded-lg hover:bg-muted shrink-0"
              aria-label="Edit profile"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {/* Chats / Stories / Channels Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full bg-muted/50" data-ocid="sidebar.tab">
            <TabsTrigger
              value="chats"
              className="flex-1"
              data-ocid="sidebar.chats_tab"
            >
              <MessageCircle className="h-3.5 w-3.5 mr-1" />
              Chats
            </TabsTrigger>
            <TabsTrigger
              value="status"
              className="flex-1"
              data-ocid="sidebar.status_tab"
            >
              <div
                className="w-3 h-3 mr-1 rounded-full border-2 shrink-0"
                style={{ borderColor: "currentColor" }}
              />
              Stories
            </TabsTrigger>
            <TabsTrigger
              value="channels"
              className="flex-1"
              data-ocid="sidebar.channels_tab"
            >
              <Radio className="h-3.5 w-3.5 mr-1" />
              Channels
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chats" className="mt-0">
            {/* Search */}
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                data-ocid="sidebar.search_input"
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-input border-border h-9 text-sm"
              />
            </div>
          </TabsContent>

          <TabsContent value="status" className="mt-0" />
          <TabsContent value="channels" className="mt-0" />
        </Tabs>
      </div>

      {/* Content area */}
      {activeTab === "status" ? (
        <StatusView
          currentUserId={currentUserId}
          currentProfile={currentProfile}
          onStartChat={onStartChat}
        />
      ) : activeTab === "channels" ? (
        <ChannelsTab
          currentUserId={currentUserId}
          onSelectChannel={onSelectChannel}
        />
      ) : (
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div data-ocid="sidebar.conversation_list">
            {isLoading ? (
              <div className="flex flex-col gap-1 p-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    <Skeleton className="w-11 h-11 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div
                data-ocid="sidebar.empty_state"
                className="flex flex-col items-center justify-center py-16 px-6 text-center"
              >
                <MessageCircle className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">
                  {search ? "No conversations found" : "No conversations yet"}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  {!search && "Tap + to start a new chat"}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv, idx) => (
                <ConversationItem
                  key={conv.id.toString()}
                  conversation={conv}
                  currentUserId={currentUserId}
                  isActive={activeConversationId === conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  index={idx}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Edit Profile & New Chat Modals */}
      <EditProfileModal
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
        currentProfile={currentProfile}
      />
      <NewChatModal
        open={newChatOpen}
        onOpenChange={setNewChatOpen}
        currentUserId={currentUserId}
        onConversationCreated={handleConversationCreated}
      />
    </div>
  );
}
