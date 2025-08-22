import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { env } from "~/config/env";
import { publicEnv } from "~/config/publicEnv";
import crypto from "crypto";

const generateSignatureSchema = z.object({
  timestamp: z.number(),
  folder: z.string().optional(),
  auto_chaptering: z.boolean().optional(),
  resource_type: z.string(),
});

export const generateUploadSignatureFn = createServerFn({
  method: "POST",
})
  .validator(generateSignatureSchema)
  .handler(async ({ data }) => {
    // Validate environment configuration
    if (!env.apiKey || !env.apiSecret || !publicEnv.cloudName) {
      throw new Error("Cloudinary configuration is incomplete");
    }

    // Build parameters to sign (alphabetically sorted)
    const paramsToSign: Record<string, string> = {
      timestamp: data.timestamp.toString(),
    };

    // Add optional parameters if provided
    if (data.folder) {
      paramsToSign.folder = data.folder;
    }

    if (data.auto_chaptering) {
      paramsToSign.auto_chaptering = "true";
    }

    // Note: resource_type should NOT be included in signature generation
    // per Cloudinary docs - it's excluded along with file, cloud_name, and api_key
    if (!data.resource_type) {
      throw new Error("resource_type is required for video uploads");
    }

    // Sort parameters alphabetically
    const sortedParams = Object.keys(paramsToSign)
      .sort()
      .map((key) => `${key}=${paramsToSign[key]}`)
      .join("&");

    // Create signature string with API secret appended
    const signatureString = sortedParams + env.apiSecret;
    
    // Generate SHA-1 signature (Cloudinary default)
    const signature = crypto
      .createHash("sha1")
      .update(signatureString)
      .digest("hex");

    return {
      signature,
      apiKey: env.apiKey,
      timestamp: data.timestamp,
      cloudName: publicEnv.cloudName,
      signedParams: paramsToSign,
    };
  });
