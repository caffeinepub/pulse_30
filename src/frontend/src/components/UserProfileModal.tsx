import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { MessageCircle, X } from "lucide-react";
import { useGetUserProfile, useIsUserOnline } from "../hooks/useQueries";

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

interface UserProfileModalProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartChat: (userId: string) => void;
}

export default function UserProfileModal({
  userId,
  open,
  onOpenChange,
  onStartChat,
}: UserProfileModalProps) {
  const { data: profile, isLoading } = useGetUserProfile(userId);
  const { data: isOnline } = useIsUserOnline(userId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
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
              onClick={() => onOpenChange(false)}
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
                    onOpenChange(false);
                  }}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
