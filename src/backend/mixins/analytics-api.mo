import Runtime "mo:core/Runtime";
import Types "../types/analytics";

/// Mixin exposing the analytics query endpoint.
/// No additional state injected — reads from shared actor state.
mixin () {

  /// Return platform-wide analytics (data only meaningful to @pulse admin).
  public query ({ caller }) func getAnalytics() : async Types.AnalyticsResult {
    Runtime.trap("not implemented");
  };
};
