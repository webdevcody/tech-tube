import { publicEnv } from "~/config/publicEnv";
import { generateUploadSignatureFn } from "~/fn/cloudinary-signature";

interface ChunkedUploadOptions {
  file: File;
  onProgress?: (progress: number) => void;
  onSuccess?: (response: any) => void;
  onError?: (error: Error) => void;
}

interface UploadSignature {
  signature: string;
  apiKey: string;
  timestamp: number;
  cloudName: string;
  signedParams: Record<string, string>;
}

export class ChunkedUploader {
  private file: File;
  private onProgress?: (progress: number) => void;
  private onSuccess?: (response: any) => void;
  private onError?: (error: Error) => void;
  private uniqueUploadId: string;
  private chunkSize: number = 5 * 1024 * 1024; // 5MB chunks
  private totalChunks: number;
  private currentChunk: number = 0;
  private abortController: AbortController;
  private signature: UploadSignature | null = null;

  constructor(options: ChunkedUploadOptions) {
    this.file = options.file;
    this.onProgress = options.onProgress;
    this.onSuccess = options.onSuccess;
    this.onError = options.onError;
    this.uniqueUploadId = this.generateUniqueUploadId();
    this.totalChunks = Math.ceil(this.file.size / this.chunkSize);
    this.abortController = new AbortController();
  }

  private generateUniqueUploadId(): string {
    return `uqid-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  public async upload(): Promise<void> {
    if (!publicEnv.cloudName) {
      this.onError?.(new Error("Cloudinary configuration missing"));
      return;
    }

    try {
      // Generate signature for signed upload
      const timestamp = Math.round(Date.now() / 1000);
      const signatureRequest = {
        timestamp,
        folder: "videos",
        auto_chaptering: true,
        auto_transcription: true,
        resource_type: "video",
      };
      console.log("Sending signature request with:", signatureRequest);
      this.signature = await generateUploadSignatureFn({
        data: signatureRequest,
      });
      console.log("Received signature response:", this.signature);

      await this.uploadChunk(0, Math.min(this.chunkSize, this.file.size));
    } catch (error) {
      this.onError?.(error as Error);
    }
  }

  private async uploadChunk(start: number, end: number): Promise<void> {
    if (this.abortController.signal.aborted) {
      return;
    }

    if (!this.signature) {
      throw new Error("Upload signature not generated");
    }

    const formData = new FormData();
    formData.append("file", this.file.slice(start, end));
    formData.append("api_key", this.signature.apiKey);
    formData.append("timestamp", this.signature.timestamp.toString());
    formData.append("signature", this.signature.signature);
    
    // Add resource_type parameter (required for upload but not signed)
    formData.append("resource_type", "video");
    
    // Add all signed parameters to the request
    Object.entries(this.signature.signedParams).forEach(([key, value]) => {
      if (key !== "timestamp") { // timestamp is already added above
        formData.append(key, value);
      }
    });

    const contentRange = `bytes ${start}-${end - 1}/${this.file.size}`;
    
    const progress = Math.round((start / this.file.size) * 100);
    this.onProgress?.(progress);

    console.log(
      `Uploading chunk ${this.currentChunk + 1}/${this.totalChunks} for uniqueUploadId: ${
        this.uniqueUploadId
      }; start: ${start}, end: ${end - 1}`
    );
    
    console.log("FormData contents:");
    for (let [key, value] of formData.entries()) {
      if (key !== "file") { // Don't log the actual file data
        console.log(`${key}: ${value}`);
      }
    }

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.signature.cloudName}/video/upload`,
        {
          method: "POST",
          body: formData,
          headers: {
            "X-Unique-Upload-Id": this.uniqueUploadId,
            "Content-Range": contentRange,
          },
          signal: this.abortController.signal,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Chunk upload failed: ${errorText}`);
      }

      this.currentChunk++;

      if (this.currentChunk < this.totalChunks) {
        const nextStart = this.currentChunk * this.chunkSize;
        const nextEnd = Math.min(nextStart + this.chunkSize, this.file.size);
        await this.uploadChunk(nextStart, nextEnd);
      } else {
        const uploadResponse = await response.json();
        this.onProgress?.(100);
        this.onSuccess?.(uploadResponse);
        console.info("File upload complete.");
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Upload cancelled");
        return;
      }
      console.error("Error uploading chunk:", error);
      throw error;
    }
  }

  public cancel(): void {
    this.abortController.abort();
  }
}


export function supportsChunkedUpload(fileSize: number): boolean {
  // Use chunked upload for files larger than 100MB
  return fileSize > 100 * 1024 * 1024;
}