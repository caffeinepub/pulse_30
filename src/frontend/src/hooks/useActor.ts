import {
  createActorWithConfig,
  useActor as useCoreActor,
} from "@caffeineai/core-infrastructure";
import type { Backend } from "../backend";
import { createActor } from "../backend";

// Pre-bind createActor so callers don't need to pass it
const boundCreateActor = (
  canisterId: string,
  uploadFile: Parameters<typeof createActor>[1],
  downloadFile: Parameters<typeof createActor>[2],
  options: Parameters<typeof createActor>[3],
) => createActor(canisterId, uploadFile, downloadFile, options);

export function useActor(): { actor: Backend | null; isFetching: boolean } {
  return useCoreActor(boundCreateActor) as {
    actor: Backend | null;
    isFetching: boolean;
  };
}

export { createActorWithConfig };
