import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Types "../types/bookmarks";

module {
  public type BookmarkStore = Map.Map<Principal, List.List<Nat>>;

  /// Add a post ID to the caller's bookmark list. No-op if already bookmarked.
  public func bookmarkPost(
    store : BookmarkStore,
    caller : Principal,
    postId : Nat,
  ) : Types.BookmarkResult {
    Runtime.trap("not implemented");
  };

  /// Remove a post ID from the caller's bookmark list.
  public func unbookmarkPost(
    store : BookmarkStore,
    caller : Principal,
    postId : Nat,
  ) : Types.BookmarkResult {
    Runtime.trap("not implemented");
  };

  /// Return all post IDs bookmarked by the caller.
  public func getBookmarkedPostIds(
    store : BookmarkStore,
    caller : Principal,
  ) : [Nat] {
    Runtime.trap("not implemented");
  };
};
