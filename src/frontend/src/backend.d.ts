import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type ConversationType = {
    __kind__: "group";
    group: string;
} | {
    __kind__: "direct";
    direct: null;
};
export interface Conversation {
    id: ConversationId;
    lastMessageTimestamp: bigint;
    members: Array<UserId>;
    messages: Array<Message>;
    type: ConversationType;
}
export type Timestamp = bigint;
export type CommentId = bigint;
export interface StatusContent {
    text: string;
    mediaUrl?: string;
    mediaType?: MediaType;
}
export interface MessageContent {
    text: string;
    mediaUrl?: string;
    mediaType?: MediaType;
}
export type StatusId = bigint;
export type ConversationId = bigint;
export type UserId = Principal;
export interface StatusInteractions {
    likeCount: bigint;
    comments: Array<StatusCommentWithProfile>;
    likedByMe: boolean;
}
export type MessageId = bigint;
export interface StatusCommentWithProfile {
    id: CommentId;
    text: string;
    author: UserProfile;
    timestamp: Timestamp;
}
export interface Message {
    id: MessageId;
    content: MessageContent;
    readReceipts: Array<MessageReadReceipt>;
    sender: UserId;
    timestamp: Timestamp;
}
export interface MessageReadReceipt {
    userId: UserId;
    timestamp: Timestamp;
}
export interface Status {
    id: StatusId;
    content: StatusContent;
    author: UserId;
    timestamp: Timestamp;
}
export type MediaType = {
    __kind__: "audio";
    audio: null;
} | {
    __kind__: "other";
    other: string;
} | {
    __kind__: "video";
    video: null;
} | {
    __kind__: "document";
    document: null;
} | {
    __kind__: "image";
    image: null;
};
export interface MessageInput {
    content: MessageContent;
}
export interface UserProfile {
    bio?: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    lastSeen: Timestamp;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addStatus(content: StatusContent): Promise<StatusId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    commentOnStatus(statusId: StatusId, text: string): Promise<CommentId>;
    createDirectConversation(otherUser: UserId): Promise<ConversationId>;
    createGroupConversation(name: string, members: Array<UserId>): Promise<ConversationId>;
    deleteGroupName(conversationId: ConversationId): Promise<void>;
    getAllStories(): Promise<Array<[UserProfile, Array<Status>]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContactStatuses(): Promise<Array<[UserProfile, Array<Status>]>>;
    getConversation(conversationId: ConversationId): Promise<Conversation | null>;
    getMessageReadReceipts(conversationId: ConversationId, messageId: MessageId): Promise<Array<MessageReadReceipt> | null>;
    getMessages(conversationId: ConversationId, offset: bigint, limit: bigint): Promise<Array<Message>>;
    getMyConversations(): Promise<Array<Conversation>>;
    getMyStatuses(): Promise<Array<Status>>;
    getPaginatedMessages(conversationId: ConversationId, offset: bigint, limit: bigint): Promise<Array<Message>>;
    getStatusInteractions(statusId: StatusId): Promise<StatusInteractions>;
    getUnreadCount(conversationId: ConversationId): Promise<bigint>;
    getUserByPrincipal(userId: UserId): Promise<UserProfile | null>;
    getUserProfile(userId: UserId): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isUserOnline(userId: UserId): Promise<boolean>;
    likeStatus(statusId: StatusId): Promise<void>;
    listUserConversations(): Promise<Array<Conversation>>;
    markAsRead(conversationId: ConversationId): Promise<void>;
    markMessagesAsRead(conversationId: ConversationId): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchUserByUsername(username: string): Promise<{
        userId: UserId;
        profile: UserProfile;
    } | null>;
    sendMessage(conversationId: ConversationId, messageInput: MessageInput): Promise<MessageId>;
    unlikeStatus(statusId: StatusId): Promise<void>;
    updateCallerAvatar(avatarUrl: string): Promise<void>;
    updateCallerBio(bio: string): Promise<void>;
    updateCallerDisplayName(displayName: string): Promise<void>;
    updateGroupAvatar(conversationId: ConversationId, avatarUrl: string): Promise<void>;
    updateGroupName(conversationId: ConversationId, newName: string): Promise<void>;
    updateLastSeen(): Promise<void>;
}
