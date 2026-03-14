import { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Conversation,
  ConversationId,
  MediaType,
  Message,
  MessageInput,
  Status,
  StatusContent,
  StatusId,
  UserId,
  UserProfile,
} from "../backend";
import { useActor } from "./useActor";

// ─── Shared types (not in backend.d.ts yet) ───────────────────────────────────
export type ChannelId = bigint;
export type ChannelPostId = bigint;
export type ChannelCommentId = bigint;

export interface Channel {
  id: ChannelId;
  name: string;
  description: string;
  avatarUrl?: string;
  owner: UserId;
  createdAt: bigint;
}

export interface ChannelWithMeta {
  channel: Channel;
  followerCount: bigint;
  isFollowing: boolean;
  ownerProfile: UserProfile;
}

export interface ChannelPostContent {
  text: string;
  mediaUrl?: string;
  mediaType?: MediaType;
}

export interface ChannelPost {
  id: ChannelPostId;
  channelId: ChannelId;
  author: UserId;
  content: ChannelPostContent;
  timestamp: bigint;
}

export interface ChannelCommentWithProfile {
  id: ChannelCommentId;
  text: string;
  author: UserProfile;
  timestamp: bigint;
}

export interface ChannelPostInteractions {
  likeCount: bigint;
  likedByMe: boolean;
  comments: ChannelCommentWithProfile[];
}

// ─── Existing hooks ───────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useListUserConversations() {
  const { actor, isFetching } = useActor();
  return useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listUserConversations();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 3000,
  });
}

export function useGetMessages(conversationId: ConversationId | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Message[]>({
    queryKey: ["messages", conversationId?.toString()],
    queryFn: async () => {
      if (!actor || conversationId === null) return [];
      return actor.getPaginatedMessages(conversationId, BigInt(0), BigInt(100));
    },
    enabled: !!actor && !isFetching && conversationId !== null,
    refetchInterval: 3000,
  });
}

export function useGetUserProfile(userId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      if (!actor || !userId) return null;
      try {
        return actor.getUserProfile(Principal.fromText(userId));
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!userId,
    staleTime: 60000,
  });
}

export function useIsUserOnline(userId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["online", userId],
    queryFn: async () => {
      if (!actor || !userId) return false;
      try {
        return actor.isUserOnline(Principal.fromText(userId));
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching && !!userId,
    refetchInterval: 10000,
  });
}

export function useSearchUserByUsername() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.searchUserByUsername(username);
    },
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      conversationId,
      messageInput,
    }: {
      conversationId: ConversationId;
      messageInput: MessageInput;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.sendMessage(conversationId, messageInput);
    },
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", conversationId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useCreateDirectConversation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (otherUser: UserId) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createDirectConversation(otherUser);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useCreateGroupConversation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      members,
    }: {
      name: string;
      members: UserId[];
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createGroupConversation(name, members);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useMarkMessagesAsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (conversationId: ConversationId) => {
      if (!actor) throw new Error("Actor not available");
      await actor.markMessagesAsRead(conversationId);
    },
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", conversationId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useUpdateLastSeen() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateLastSeen();
    },
  });
}

export function useAddStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: StatusContent) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addStatus(content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myStatuses"] });
      queryClient.invalidateQueries({ queryKey: ["contactStatuses"] });
      queryClient.invalidateQueries({ queryKey: ["allStories"] });
    },
  });
}

export function useGetMyStatuses() {
  const { actor, isFetching } = useActor();
  return useQuery<Status[]>({
    queryKey: ["myStatuses"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyStatuses();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useGetContactStatuses() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[UserProfile, Array<Status>]>>({
    queryKey: ["contactStatuses"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getContactStatuses();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useGetAllStories() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[UserProfile, Array<Status>]>>({
    queryKey: ["allStories"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllStories();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useUpdateCallerBio() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bio: string) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateCallerBio(bio);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useUpdateCallerAvatar() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (avatarUrl: string) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateCallerAvatar(avatarUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useUpdateCallerDisplayName() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (displayName: string) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateCallerDisplayName(displayName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useLikeStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (statusId: StatusId) => {
      if (!actor) throw new Error("Actor not available");
      await (actor as any).likeStatus(statusId);
    },
    onSuccess: (_, statusId) => {
      queryClient.invalidateQueries({
        queryKey: ["statusInteractions", statusId.toString()],
      });
    },
  });
}

export function useUnlikeStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (statusId: StatusId) => {
      if (!actor) throw new Error("Actor not available");
      await (actor as any).unlikeStatus(statusId);
    },
    onSuccess: (_, statusId) => {
      queryClient.invalidateQueries({
        queryKey: ["statusInteractions", statusId.toString()],
      });
    },
  });
}

export function useCommentOnStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      statusId,
      text,
    }: { statusId: StatusId; text: string }) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).commentOnStatus(statusId, text);
    },
    onSuccess: (_, { statusId }) => {
      queryClient.invalidateQueries({
        queryKey: ["statusInteractions", statusId.toString()],
      });
    },
  });
}

export function useGetStatusInteractions(statusId: StatusId | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["statusInteractions", statusId?.toString()],
    queryFn: async () => {
      if (!actor || statusId === null) return null;
      return (actor as any).getStatusInteractions(statusId);
    },
    enabled: !!actor && !isFetching && statusId !== null,
    refetchInterval: 5000,
  });
}

// ─── Channel hooks ────────────────────────────────────────────────────────────

export function useGetAllChannels() {
  const { actor, isFetching } = useActor();
  return useQuery<ChannelWithMeta[]>({
    queryKey: ["channels"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllChannels();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15000,
  });
}

export function useGetChannel(channelId: ChannelId | null) {
  const { actor, isFetching } = useActor();
  return useQuery<ChannelWithMeta | null>({
    queryKey: ["channel", channelId?.toString()],
    queryFn: async () => {
      if (!actor || channelId === null) return null;
      return (actor as any).getChannel(channelId);
    },
    enabled: !!actor && !isFetching && channelId !== null,
    refetchInterval: 10000,
  });
}

export function useCreateChannel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      description,
      avatarUrl,
    }: {
      name: string;
      description: string;
      avatarUrl?: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).createChannel(name, description, avatarUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
    },
  });
}

export function useUpdateChannel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      channelId,
      name,
      description,
      avatarUrl,
    }: {
      channelId: ChannelId;
      name: string;
      description: string;
      avatarUrl?: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).updateChannel(
        channelId,
        name,
        description,
        avatarUrl,
      );
    },
    onSuccess: (_, { channelId }) => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      queryClient.invalidateQueries({
        queryKey: ["channel", channelId.toString()],
      });
    },
  });
}

export function useFollowChannel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (channelId: ChannelId) => {
      if (!actor) throw new Error("Actor not available");
      await (actor as any).followChannel(channelId);
    },
    onSuccess: (_, channelId) => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      queryClient.invalidateQueries({
        queryKey: ["channel", channelId.toString()],
      });
    },
  });
}

export function useUnfollowChannel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (channelId: ChannelId) => {
      if (!actor) throw new Error("Actor not available");
      await (actor as any).unfollowChannel(channelId);
    },
    onSuccess: (_, channelId) => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      queryClient.invalidateQueries({
        queryKey: ["channel", channelId.toString()],
      });
    },
  });
}

export function useGetChannelPosts(channelId: ChannelId | null) {
  const { actor, isFetching } = useActor();
  return useQuery<ChannelPost[]>({
    queryKey: ["channelPosts", channelId?.toString()],
    queryFn: async () => {
      if (!actor || channelId === null) return [];
      return (actor as any).getChannelPosts(channelId);
    },
    enabled: !!actor && !isFetching && channelId !== null,
    refetchInterval: 10000,
  });
}

export function useAddChannelPost(channelId: ChannelId | null) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: ChannelPostContent) => {
      if (!actor || channelId === null) throw new Error("Actor not available");
      return (actor as any).addChannelPost(channelId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["channelPosts", channelId?.toString()],
      });
    },
  });
}

export function useGetChannelPostInteractions(postId: ChannelPostId | null) {
  const { actor, isFetching } = useActor();
  return useQuery<ChannelPostInteractions | null>({
    queryKey: ["channelPostInteractions", postId?.toString()],
    queryFn: async () => {
      if (!actor || postId === null) return null;
      return (actor as any).getChannelPostInteractions(postId);
    },
    enabled: !!actor && !isFetching && postId !== null,
    refetchInterval: 10000,
  });
}

export function useLikeChannelPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: ChannelPostId) => {
      if (!actor) throw new Error("Actor not available");
      await (actor as any).likeChannelPost(postId);
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({
        queryKey: ["channelPostInteractions", postId.toString()],
      });
    },
  });
}

export function useUnlikeChannelPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: ChannelPostId) => {
      if (!actor) throw new Error("Actor not available");
      await (actor as any).unlikeChannelPost(postId);
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({
        queryKey: ["channelPostInteractions", postId.toString()],
      });
    },
  });
}

export function useCommentOnChannelPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      postId,
      text,
    }: { postId: ChannelPostId; text: string }) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).commentOnChannelPost(postId, text);
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({
        queryKey: ["channelPostInteractions", postId.toString()],
      });
    },
  });
}

export function useForwardChannelPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      postId,
      conversationId,
    }: {
      postId: ChannelPostId;
      conversationId: ConversationId;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).forwardChannelPost(postId, conversationId);
    },
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", conversationId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
