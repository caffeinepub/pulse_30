import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";

module {
  public type ViewerStore = Map.Map<Nat, List.List<Principal>>;

  /// Record that `viewer` has viewed story `statusId`. De-dupes by principal.
  public func recordView(
    store : ViewerStore,
    statusId : Nat,
    viewer : Principal,
  ) {
    Runtime.trap("not implemented");
  };

  /// Return the number of unique viewers for a given story.
  public func viewCount(
    store : ViewerStore,
    statusId : Nat,
  ) : Nat {
    Runtime.trap("not implemented");
  };
};
