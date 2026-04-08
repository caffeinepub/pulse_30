import type { Agent } from "@icp-sdk/core/agent";

/**
 * Minimal StorageClient implementation for media uploads.
 * Mirrors the @caffeineai/object-storage StorageClient interface.
 */
export class StorageClient {
  private bucketName: string;
  private gatewayUrl: string;
  private canisterId: string;
  private projectId: string;
  private agent: Agent;

  constructor(
    bucketName: string,
    gatewayUrl: string,
    canisterId: string,
    projectId: string,
    agent: Agent,
  ) {
    this.bucketName = bucketName;
    this.gatewayUrl = gatewayUrl.replace(/\/$/, "");
    this.canisterId = canisterId;
    this.projectId = projectId;
    this.agent = agent;
  }

  async putFile(
    bytes: Uint8Array<ArrayBuffer>,
    onProgress?: (pct: number) => void,
    mimeType?: string,
  ): Promise<{ hash: string }> {
    const contentType = mimeType || "application/octet-stream";

    // Compute a simple hash from bytes for deduplication
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      bytes.buffer as ArrayBuffer,
    );
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    const base =
      this.gatewayUrl !== "nogateway"
        ? this.gatewayUrl
        : "https://blob.caffeine.ai";
    const uploadUrl = `${base}/upload/${this.projectId}/${this.bucketName}/${hash}`;

    onProgress?.(10);

    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: contentType });

    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
      },
      body: blob,
    });

    onProgress?.(100);

    if (!response.ok) {
      // Try POST fallback
      const postUrl = `${base}/blobs`;
      const formData = new FormData();
      formData.append("file", blob, hash);
      const postResponse = await fetch(postUrl, {
        method: "POST",
        body: formData,
      });
      if (!postResponse.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }
    }

    return { hash };
  }

  async getDirectURL(hash: string): Promise<string> {
    const base =
      this.gatewayUrl !== "nogateway"
        ? this.gatewayUrl
        : "https://blob.caffeine.ai";
    return `${base}/blobs/${this.projectId}/${this.bucketName}/${hash}`;
  }
}
