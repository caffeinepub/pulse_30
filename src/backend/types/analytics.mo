module {
  /// Aggregate metrics for the @pulse admin analytics dashboard.
  public type AnalyticsRecord = {
    totalUsers        : Nat;
    totalMessagesSent : Nat;
    totalGoldVolume   : Nat;
    activeUsers       : Nat;
    channelsCreated   : Nat;
    storiesPosted     : Nat;
  };
};
