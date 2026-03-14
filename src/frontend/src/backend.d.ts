import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Conversation {
    id: ConversationId;
    lastMessageTimestamp: bigint;
    members: Array<UserId>;
    messages: Array<Message>;
    type: ConversationType;
}
export type Timestamp = bigint;
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
export type CommentId = bigint;
export type ConversationId = bigint;
export type UserId = Principal;
export type MessageId = bigint;
export interface Message {
    id: MessageId;
    content: MessageContent;
    readReceipts: Array<MessageReadReceipt>;
    sender: UserId;
    timestamp: Timestamp;
}
export type ConversationType = {
    __kind__: "group";
    group: string;
} | {
    __kind__: "direct";
    direct: null;
};
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
export interface StatusCommentWithProfile {
    id: CommentId;
    author: UserProfile;
    text: string;
    timestamp: Timestamp;
}
export interface StatusInteractions {
    likeCount: bigint;
    likedByMe: boolean;
    comments: Array<StatusCommentWithProfile>;
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
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContactStatuses(): Promise<Array<[UserProfile, Array<Status>]>>;
    getConversation(conversationId: ConversationId): Promise<Conversation | null>;
    getMessageReadReceipts(conversationId: ConversationId, messageId: MessageId): Promise<Array<MessageReadReceipt> | null>;
    getMyStatuses(): Promise<Array<Status>>;
    getPaginatedMessages(conversationId: ConversationId, offset: bigint, limit: bigint): Promise<Array<Message>>;
    getStatusInteractions(statusId: StatusId): Promise<StatusInteractions>;
    getUserProfile(userId: UserId): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isUserOnline(userId: UserId): Promise<boolean>;
    likeStatus(statusId: StatusId): Promise<void>;
    listUserConversations(): Promise<Array<Conversation>>;
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
    updateLastSeen(): Promise<void>;
}
