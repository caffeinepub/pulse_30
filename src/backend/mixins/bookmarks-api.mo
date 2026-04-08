import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

/// Mixin exposing the public bookmark API.
/// Injected state: channelPostBookmarks (principal -> list of post IDs)
mixin (channelPostBookmarks : Map.Map<Principal, List.List<Nat>>) {

  /// Bookmark a channel post for the caller.
  public shared ({ caller }) func bookmarkPost(postId : Nat) : async { #ok; #err : Text } {
    Runtime.trap("not implemented");
  };

  /// Remove a bookmark for the caller.
  public shared ({ caller }) func unbookmarkPost(postId : Nat) : async { #ok; #err : Text } {
    Runtime.trap("not implemented");
  };

  /// Return all bookmarked channel posts for the caller.
  public query ({ caller }) func getMyBookmarkedPosts() : async [Nat] {
    Runtime.trap("not implemented");
  };
};
