import { api } from "@starter-saas/backend/convex/_generated/api";
import type { Id } from "@starter-saas/backend/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const uploadImage = async (file: File): Promise<Id<"_storage"> | null> => {
    try {
      setIsUploading(true);

      // Generate upload URL
      const uploadUrl = await generateUploadUrl();

      // Upload file to Convex storage
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error("Failed to upload image");
      }

      const { storageId } = await result.json();

      // Return the storage ID as proper Convex ID type
      // The URL will be generated when needed
      toast.success("Image uploaded successfully!");
      return storageId as Id<"_storage">;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image. Please try again.");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadImage,
    isUploading,
  };
}
