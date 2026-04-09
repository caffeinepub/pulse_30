// Project-level useActor wrapper.
// Binds the infrastructure's generic useActor to this project's createActor function.
import { useActor as useActorBase } from "@caffeineai/core-infrastructure";
import type { Backend } from "../backend";
import { createActor } from "../backend";

// Re-export typed actor hook so callers can `import { useActor } from "./useActor"`
// and get back `{ actor: Backend | null, isFetching: boolean }`.
export function useActor(): { actor: Backend | null; isFetching: boolean } {
  return useActorBase(createActor) as {
    actor: Backend | null;
    isFetching: boolean;
  };
}
