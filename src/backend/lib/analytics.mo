import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Types "../types/analytics";

module {
  /// Compute analytics from existing state.
  /// `sevenDaysCutoff` is the timestamp (nanoseconds) below which activity is not counted as "active".
  public func computeAnalytics(
    users : Map.Map<Principal, Any>,
    conversations : Map.Map<Nat, Any>,
    goldTransactions : Map.Map<Principal, List.List<Any>>,
    channels : Map.Map<Nat, Any>,
    statuses : Map.Map<Nat, Any>,
    sevenDaysCutoff : Int,
  ) : Types.AnalyticsResult {
    Runtime.trap("not implemented");
  };
};
