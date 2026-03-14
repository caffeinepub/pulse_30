import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import VarArray "mo:core/VarArray";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Set "mo:core/Set";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";



actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Type Definitions
  type UserId = Principal;
  type ConversationId = Nat;
  type MessageId = Nat;
  type StatusId = Nat;
  type CommentId = Nat;
  type Timestamp = Int;

  public type ConversationType = {
    #direct;
    #group : Text;
  };

  public type MediaType = {
    #image; // JPEG/PNG
    #video; // MP4/webm
    #audio; // MP3
    #document; // PDF, docx, etc.
    #other : Text;
  };

  public type UserProfile = {
    username : Text;
    displayName : Text;
    lastSeen : Timestamp;
    bio : ?Text;
    avatarUrl : ?Text;
  };

  public type MessageContent = {
    text : Text;
    mediaUrl : ?Text;
    mediaType : ?MediaType;
  };

  public type MessageReadReceipt = {
    userId : UserId;
    timestamp : Timestamp;
  };

  public type Message = {
    id : MessageId;
    sender : UserId;
    content : MessageContent;
    timestamp : Timestamp;
    readReceipts : [MessageReadReceipt];
  };

  public type Conversation = {
    id : ConversationId;
    members : [UserId];
    messages : [Message];
    type_ : ConversationType;
    lastMessageTimestamp : Int;
  };

  public type StatusContent = {
    text : Text;
    mediaUrl : ?Text;
    mediaType : ?MediaType;
  };

  public type Status = {
    id : StatusId;
    author : UserId;
    content : StatusContent;
    timestamp : Timestamp;
  };

  public type StatusComment = {
    id : CommentId;
    statusId : StatusId;
    author : UserId;
    text : Text;
    timestamp : Timestamp;
  };

  public type StatusCommentWithProfile = {
    id : CommentId;
    author : UserProfile;
    text : Text;
    timestamp : Timestamp;
  };

  public type StatusInteractions = {
    likeCount : Nat;
    likedByMe : Bool;
    comments : [StatusCommentWithProfile];
  };

  // Message DTOs
  public type MessageInput = {
    content : MessageContent;
  };

  // State Management
  var nextConversationId : ConversationId = 1;
  var nextMessageId : MessageId = 1;
  var nextStatusId : StatusId = 1;
  var nextCommentId : CommentId = 1;

  let conversations = Map.empty<ConversationId, Conversation>();
  let users = Map.empty<UserId, UserProfile>();
  let statuses = Map.empty<StatusId, Status>();
  let statusLikes = Map.empty<StatusId, Set.Set<UserId>>();
  let statusComments = Map.empty<CommentId, StatusComment>();

  // Internal functions
  func getConversationOrTrap(conversationId : ConversationId) : Conversation {
    switch (conversations.get(conversationId)) {
      case (null) { Runtime.trap("Conversation not found") };
      case (?conv) { conv };
    };
  };

  func getUserProfileOrTrap(userId : UserId) : UserProfile {
    switch (users.get(userId)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };
  };

  func saveConversation(conversation : Conversation) {
    conversations.add(conversation.id, conversation);
  };

  func isConversationMember(conversationId : ConversationId, userId : UserId) : Bool {
    switch (conversations.get(conversationId)) {
      case (null) { false };
      case (?conv) {
        conv.members.findIndex(func(m) { m == userId }) != null;
      };
    };
  };

  // User Endpoints
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    users.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    users.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(userId : UserId) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    users.get(userId);
  };

  public shared ({ caller }) func updateLastSeen() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update last seen");
    };
    let now = Time.now();
    let currentUser = getUserProfileOrTrap(caller);
    users.add(
      caller,
      {
        username = currentUser.username;
        displayName = currentUser.displayName;
        lastSeen = now;
        bio = currentUser.bio;
        avatarUrl = currentUser.avatarUrl;
      },
    );
  };

  public shared ({ caller }) func updateCallerBio(bio : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update bio");
    };
    let currentUser = getUserProfileOrTrap(caller);
    users.add(
      caller,
      {
        username = currentUser.username;
        displayName = currentUser.displayName;
        lastSeen = currentUser.lastSeen;
        bio = ?bio;
        avatarUrl = currentUser.avatarUrl;
      },
    );
  };

  public shared ({ caller }) func updateCallerAvatar(avatarUrl : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update avatar");
    };
    let currentUser = getUserProfileOrTrap(caller);
    users.add(
      caller,
      {
        username = currentUser.username;
        displayName = currentUser.displayName;
        lastSeen = currentUser.lastSeen;
        bio = currentUser.bio;
        avatarUrl = ?avatarUrl;
      },
    );
  };

  public shared ({ caller }) func updateCallerDisplayName(displayName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update display name");
    };
    let currentUser = getUserProfileOrTrap(caller);
    users.add(
      caller,
      {
        username = currentUser.username;
        displayName = displayName;
        lastSeen = currentUser.lastSeen;
        bio = currentUser.bio;
        avatarUrl = currentUser.avatarUrl;
      },
    );
  };

  public query ({ caller }) func isUserOnline(userId : UserId) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check online status");
    };
    switch (users.get(userId)) {
      case (null) { false };
      case (?profile) {
        Time.now() - profile.lastSeen < 300_000_000_000;
      };
    };
  };

  // New search functionality
  public shared ({ caller }) func searchUserByUsername(username : Text) : async ?{ userId : UserId; profile : UserProfile } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search profiles");
    };
    let searchLower = username.toLower();
    let result = users.toArray().find(
      func((userId, profile)) { profile.username.toLower() == searchLower }
    );

    switch (result) {
      case (null) { null };
      case (?entry) {
        let (userId, profile) = entry;
        ?{ userId; profile };
      };
    };
  };

  // Conversation Endpoints
  public shared ({ caller }) func createDirectConversation(otherUser : UserId) : async ConversationId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create conversations");
    };
    // Return existing direct conversation if one already exists between these two users
    let existing = conversations.values().toArray().find(
      func(conv) {
        switch (conv.type_) {
          case (#group(_)) { false };
          case (#direct) {
            let hasCallerMember = conv.members.findIndex(func(m) { m == caller }) != null;
            let hasOtherMember = conv.members.findIndex(func(m) { m == otherUser }) != null;
            hasCallerMember and hasOtherMember;
          };
        };
      }
    );
    switch (existing) {
      case (?conv) { conv.id };
      case (null) {
        let convId = nextConversationId;
        nextConversationId += 1;
        let conversation = {
          id = convId;
          members = [caller, otherUser];
          messages = [];
          type_ = #direct;
          lastMessageTimestamp = Time.now();
        };
        saveConversation(conversation);
        convId;
      };
    };
  };

  public shared ({ caller }) func createGroupConversation(name : Text, members : [UserId]) : async ConversationId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create conversations");
    };
    let convId = nextConversationId;
    nextConversationId += 1;
    let conversation = {
      id = convId;
      members = members.concat([caller]);
      messages = [];
      type_ = #group(name);
      lastMessageTimestamp = Time.now();
    };
    saveConversation(conversation);
    convId;
  };

  public query ({ caller }) func getConversation(conversationId : ConversationId) : async ?Conversation {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view conversations");
    };
    if (not isConversationMember(conversationId, caller)) {
      Runtime.trap("Unauthorized: You are not a member of this conversation");
    };
    conversations.get(conversationId);
  };

  public query ({ caller }) func listUserConversations() : async [Conversation] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list conversations");
    };
    conversations.values().toArray().filter(
      func(conv) {
        conv.members.findIndex(func(m) { m == caller }) != null;
      }
    );
  };

  // Message Endpoints
  public shared ({ caller }) func sendMessage(conversationId : ConversationId, messageInput : MessageInput) : async MessageId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };
    if (not isConversationMember(conversationId, caller)) {
      Runtime.trap("Unauthorized: You are not a member of this conversation");
    };

    let message = {
      id = nextMessageId;
      sender = caller;
      content = messageInput.content;
      timestamp = Time.now();
      readReceipts = [{ userId = caller; timestamp = Time.now() }];
    };

    let conversation = getConversationOrTrap(conversationId);
    let updatedMessages = conversation.messages.concat([message]);
    let updatedConversation = {
      conversation with
      messages = updatedMessages;
      lastMessageTimestamp = Time.now();
    };
    saveConversation(updatedConversation);

    nextMessageId += 1;
    message.id;
  };

  public query ({ caller }) func getPaginatedMessages(conversationId : ConversationId, offset : Nat, limit : Nat) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };
    if (not isConversationMember(conversationId, caller)) {
      Runtime.trap("Unauthorized: You are not a member of this conversation");
    };

    let conversation = getConversationOrTrap(conversationId);
    let msgs = conversation.messages;
    if (offset >= msgs.size()) { return [] };
    let end = Nat.min(offset + limit, msgs.size());
    let varMsgs : [var Message] = msgs.toVarArray();
    varMsgs.sliceToArray(offset, end);
  };

  public shared ({ caller }) func markMessagesAsRead(conversationId : ConversationId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark messages as read");
    };
    if (not isConversationMember(conversationId, caller)) {
      Runtime.trap("Unauthorized: You are not a member of this conversation");
    };

    let conversation = getConversationOrTrap(conversationId);
    let now = Time.now();

    let updatedMessages = conversation.messages.map(
      func(msg) {
        if (msg.readReceipts.findIndex(func(rr) { rr.userId == caller }) != null) {
          msg;
        } else {
          let newReceipts = msg.readReceipts.concat([{ userId = caller; timestamp = now }]);
          { msg with readReceipts = newReceipts };
        };
      }
    );
    let updatedConversation = { conversation with messages = updatedMessages };
    saveConversation(updatedConversation);
  };

  public query ({ caller }) func getMessageReadReceipts(conversationId : ConversationId, messageId : MessageId) : async ?[MessageReadReceipt] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view read receipts");
    };
    if (not isConversationMember(conversationId, caller)) {
      Runtime.trap("Unauthorized: You are not a member of this conversation");
    };

    let conversation = getConversationOrTrap(conversationId);
    switch (conversation.messages.find(
      func(msg) { msg.id == messageId }
    )) {
      case (null) { null };
      case (?msg) { ?msg.readReceipts };
    };
  };

  // Custom compare function for UserId (Principal)
  func compareUserId(a : UserId, b : UserId) : Order.Order {
    let aBytes = a.toBlob();
    let bBytes = b.toBlob();
    switch (Nat.compare(aBytes.size(), bBytes.size())) {
      case (#equal) {
        var i = 0;
        while (i < aBytes.size()) {
          switch (Nat.compare(aBytes[i].toNat(), bBytes[i].toNat())) {
            case (#equal) { i += 1 };
            case (other) { return other };
          };
        };
        #equal;
      };
      case (other) { other };
    };
  };

  // Status Endpoints
  public shared ({ caller }) func addStatus(content : StatusContent) : async StatusId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add statuses");
    };
    let statusId = nextStatusId;
    nextStatusId += 1;

    let status = {
      id = statusId;
      author = caller;
      content;
      timestamp = Time.now();
    };
    statuses.add(statusId, status);
    statusId;
  };

  public query ({ caller }) func getMyStatuses() : async [Status] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view statuses");
    };
    let now = Time.now();
    statuses.values().toArray().filter(
      func(status) {
        status.author == caller and (now - status.timestamp) < (24 * 60 * 60 * 1_000_000_000);
      }
    );
  };

  public query ({ caller }) func getContactStatuses() : async [(UserProfile, [Status])] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view contact statuses");
    };

    // Find direct conversations
    let directContacts = Set.empty<UserId>();

    conversations.values().toArray().forEach(
      func(conv) {
        switch (conv.type_) {
          case (#direct) {
            if (conv.members.findIndex(func(m) { m == caller }) != null) {
              if (conv.members[0] == caller) {
                directContacts.add(conv.members[1]);
              } else {
                directContacts.add(conv.members[0]);
              };
            };
          };
          case (_) { () };
        };
      }
    );

    // Group statuses by author for direct contacts
    let now = Time.now();
    let contactStatuses = directContacts.toArray().map(func(contact) {
      let author = contact;
      let userStatuses = statuses.values().toArray().filter(
        func(status) {
          status.author == author and (now - status.timestamp) < (24 * 60 * 60 * 1_000_000_000);
        }
      );
      let authorProfile = getUserProfileOrTrap(author);
      (authorProfile, userStatuses);
    });

    contactStatuses;
  };

  // Status Interactions
  public shared ({ caller }) func likeStatus(statusId : StatusId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like statuses");
    };
    switch (statusLikes.get(statusId)) {
      case (null) {
        let likers = Set.empty<UserId>();
        likers.add(caller);
        statusLikes.add(statusId, likers);
      };
      case (?likers) {
        likers.add(caller);
      };
    };
  };

  public shared ({ caller }) func unlikeStatus(statusId : StatusId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unlike statuses");
    };
    switch (statusLikes.get(statusId)) {
      case (null) { () };
      case (?likers) {
        likers.remove(caller);
      };
    };
  };

  public shared ({ caller }) func commentOnStatus(statusId : StatusId, text : Text) : async CommentId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can comment on statuses");
    };
    let commentId = nextCommentId;
    nextCommentId += 1;
    let comment = {
      id = commentId;
      statusId;
      author = caller;
      text;
      timestamp = Time.now();
    };
    statusComments.add(commentId, comment);
    commentId;
  };

  public query ({ caller }) func getStatusInteractions(statusId : StatusId) : async StatusInteractions {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view status interactions");
    };
    let likeCount = switch (statusLikes.get(statusId)) {
      case (null) { 0 };
      case (?likers) { likers.size() };
    };
    let likedByMe = switch (statusLikes.get(statusId)) {
      case (null) { false };
      case (?likers) { likers.contains(caller) };
    };
    let comments = statusComments.values().toArray()
      .filter(func(c) { c.statusId == statusId })
      .map(func(c) {
        let authorProfile = switch (users.get(c.author)) {
          case (null) { { username = "unknown"; displayName = "Unknown"; lastSeen = 0; bio = null; avatarUrl = null } };
          case (?p) { p };
        };
        { id = c.id; author = authorProfile; text = c.text; timestamp = c.timestamp };
      });
    { likeCount; likedByMe; comments };
  };
};
