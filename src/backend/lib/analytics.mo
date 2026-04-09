import Map "mo:core/Map";
import List "mo:core/List";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Types "../types/analytics";

/// Domain logic for computing analytics metrics from stable state maps.
module {
  // 7 days expressed in nanoseconds (Time.now() returns nanoseconds)
  let sevenDaysNs : Int = 7 * 24 * 60 * 60 * 1_000_000_000;

  public type UserId = Principal;
  public type ConversationId = Nat;
  public type Timestamp = Int;

  /// Minimal slice of UserProfile needed to compute activeUsers.
  public type UserProfile = {
    username  : Text;
    lastSeen  : Timestamp;
  };

  /// Minimal slice of Conversation needed to count total messages.
  public type Message = { id : Nat };
  public type Conversation = { messages : [Message] };

  public type GoldBalance = Nat;

  /// Compute the full analytics record from injected state slices.
  /// Does NOT perform authorization — that is the mixin's responsibility.
  public func compute<UP, C>(
    users         : Map.Map<UserId, UP>,
    conversations : Map.Map<ConversationId, C>,
    goldBalances  : Map.Map<UserId, Nat>,
    channels      : Map.Map<Nat, Any>,
    statuses      : Map.Map<Nat, Any>,
    getLastSeen   : UP -> Timestamp,
    getMessages   : C  -> Nat,
  ) : Types.AnalyticsRecord {
    let now = Time.now();
    let cutoff : Int = now - sevenDaysNs;

    // totalUsers
    let totalUsers = users.size();

    // totalMessagesSent — sum message counts across all conversations
    var totalMessages : Nat = 0;
    for ((_, conv) in conversations.entries()) {
      totalMessages += getMessages(conv);
    };

    // totalGoldVolume — sum all raw balances
    var totalGold : Nat = 0;
    for ((_, bal) in goldBalances.entries()) {
      totalGold += bal;
    };

    // activeUsers — users whose lastSeen > cutoff
    var active : Nat = 0;
    for ((_, profile) in users.entries()) {
      if (getLastSeen(profile) >= cutoff) {
        active += 1;
      };
    };

    // channelsCreated
    let channelsCreated = channels.size();

    // storiesPosted
    let storiesPosted = statuses.size();

    {
      totalUsers;
      totalMessagesSent = totalMessages;
      totalGoldVolume   = totalGold;
      activeUsers       = active;
      channelsCreated;
      storiesPosted;
    };
  };
};
