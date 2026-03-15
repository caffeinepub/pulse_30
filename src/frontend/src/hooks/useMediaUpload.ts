import { HttpAgent } from "@icp-sdk/core/agent";
import { useState } from "react";
import type { MediaType } from "../backend";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";
import { useInternetIdentity } from "./useInternetIdentity";

// Map file MIME type to a canonical MIME type safe for mobile playback
function getCanonicalMimeType(file: File): string {
  const t = file.type;
  if (t.startsWith("video/")) {
    // Prefer video/mp4 for widest mobile compatibility
    return t === "video/mp4" ? "video/mp4" : "video/mp4";
  }
  if (t.startsWith("audio/")) {
    // Prefer audio/mp4 (AAC) for iOS; fallback to audio/webm
    if (t === "audio/mp4" || t === "audio/x-m4a") return "audio/mp4";
    if (t === "audio/ogg") return "audio/ogg";
    return "audio/webm";
  }
  if (t.startsWith("image/")) return t || "image/jpeg";
  return t || "application/octet-stream";
}

export function useMediaUpload() {
  const { identity } = useInternetIdentity();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const uploadMedia = async (
    file: File,
  ): Promise<{ url: string; mediaType: MediaType }> => {
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const config = await loadConfig();
      const agent = new HttpAgent({
        identity: identity || undefined,
        host: config.backend_host,
      });
      if (config.backend_host?.includes("localhost")) {
        await agent.fetchRootKey().catch(() => {});
      }
      const storageClient = new StorageClient(
        config.bucket_name,
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent,
      );
      const bytes = new Uint8Array(await file.arrayBuffer());
      const mimeType = getCanonicalMimeType(file);
      const { hash } = await storageClient.putFile(
        bytes,
        (pct) => setUploadProgress(pct),
        mimeType,
      );
      const url = await storageClient.getDirectURL(hash);

      let mediaType: MediaType;
      if (file.type.startsWith("image/")) {
        mediaType = { __kind__: "image", image: null };
      } else if (file.type.startsWith("video/")) {
        mediaType = { __kind__: "video", video: null };
      } else if (file.type.startsWith("audio/")) {
        mediaType = { __kind__: "audio", audio: null };
      } else {
        mediaType = { __kind__: "other", other: file.type };
      }

      return { url, mediaType };
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadMedia, uploadProgress, isUploading };
}
