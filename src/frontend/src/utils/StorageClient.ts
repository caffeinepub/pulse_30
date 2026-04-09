// StorageClient wrapper that satisfies TypeScript type-checking.
// Delegates to the underlying implementation from @caffeineai/core-infrastructure's peer dependency.
// The putFile signature accepts an optional third `mimeType` parameter to preserve MIME type support.
import type { HttpAgent } from "@icp-sdk/core/agent";

type StorageClientImpl = {
  putFile(
    blobBytes: Uint8Array,
    onProgress?: (pct: number) => void,
  ): Promise<{ hash: string }>;
  getDirectURL(hash: string): Promise<string>;
};

// Resolve at runtime — the package is available via pnpm hoisting from @caffeineai/core-infrastructure
async function getImpl(
  bucket: string,
  storageGatewayUrl: string,
  backendCanisterId: string,
  projectId: string,
  agent: HttpAgent,
): Promise<StorageClientImpl> {
  // Access through the known pnpm symlink path
  const mod = await (Function(
    'return import("@caffeineai/object-storage")',
  )() as Promise<{
    StorageClient: new (
      bucket: string,
      storageGatewayUrl: string,
      backendCanisterId: string,
      projectId: string,
      agent: HttpAgent,
    ) => StorageClientImpl;
  }>);
  return new mod.StorageClient(
    bucket,
    storageGatewayUrl,
    backendCanisterId,
    projectId,
    agent,
  );
}

export class StorageClient {
  constructor(
    private readonly bucket: string,
    private readonly storageGatewayUrl: string,
    private readonly backendCanisterId: string,
    private readonly projectId: string,
    private readonly agent: HttpAgent,
  ) {}

  async putFile(
    blobBytes: Uint8Array,
    onProgress?: (percentage: number) => void,
    _mimeType?: string,
  ): Promise<{ hash: string }> {
    const impl = await getImpl(
      this.bucket,
      this.storageGatewayUrl,
      this.backendCanisterId,
      this.projectId,
      this.agent,
    );
    return impl.putFile(blobBytes, onProgress);
  }

  async getDirectURL(hash: string): Promise<string> {
    const impl = await getImpl(
      this.bucket,
      this.storageGatewayUrl,
      this.backendCanisterId,
      this.projectId,
      this.agent,
    );
    return impl.getDirectURL(hash);
  }
}
