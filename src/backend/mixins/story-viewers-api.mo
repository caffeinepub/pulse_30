import Map "mo:core/Map";
import List "mo:core/List";
import Runtime "mo:core/Runtime";

/// Mixin exposing the public story viewer API.
/// Injected state: statusViewers (statusId -> list of viewer principals)
mixin (statusViewers : Map.Map<Nat, List.List<Principal>>) {

  /// Record that the caller has viewed a story.
  public shared ({ caller }) func recordStatusView(statusId : Nat) : async () {
    Runtime.trap("not implemented");
  };

  /// Return the unique view count for a story.
  public query ({ caller }) func getStatusViewCount(statusId : Nat) : async Nat {
    Runtime.trap("not implemented");
  };
};
