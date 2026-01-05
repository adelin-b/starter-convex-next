"use client";

import { Button } from "@starter-saas/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@starter-saas/ui/card";
import { Input } from "@starter-saas/ui/input";
import { Label } from "@starter-saas/ui/label";
import { Separator } from "@starter-saas/ui/separator";
import { Skeleton } from "@starter-saas/ui/skeleton";
import { Mail, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useUser } from "@/hooks/use-user";
import { ImageUpload } from "./image-upload";

export function ConvexProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    avatar: "",
  });

  const { user: profile, isLoading, betterAuthUser, firstName, lastName, imageUrl } = useUser();

  // Initialize form data when profile loads - use Better-Auth data as fallback
  useEffect(() => {
    if ((profile || betterAuthUser) && !isEditing) {
      setFormData({
        firstName: firstName || "",
        lastName: lastName || "",
        email: profile?.email || betterAuthUser?.email || "",
        avatar: imageUrl || betterAuthUser?.image || "",
      });
    }
  }, [profile, betterAuthUser, firstName, lastName, imageUrl, isEditing]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    try {
      // TODO: Implement profile update mutation
      console.warn("Profile update not implemented yet");
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: firstName || "",
      lastName: lastName || "",
      email: profile?.email || betterAuthUser?.email || "",
      avatar: imageUrl || betterAuthUser?.image || "",
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal information and preferences.</CardDescription>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleCancel} variant="outline">
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>Save Changes</Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <ImageUpload
            currentImage={
              formData.avatar && formData.avatar.trim() !== "" ? formData.avatar : undefined
            }
            firstName={formData.firstName}
            lastName={formData.lastName}
            onImageChange={async (uploadedImageUrl, _storageId, _file) => {
              // Update form data immediately
              setFormData((prev) => ({
                ...prev,
                avatar: uploadedImageUrl || "",
              }));

              if (uploadedImageUrl) {
                toast.success("Profile picture updated!");
              }
            }}
          />

          {/* Image Sync Note */}
          <div className="rounded-md bg-muted/50 p-3 text-muted-foreground text-xs">
            <strong>Note:</strong> Uploaded images are stored in your profile. To update your
            account profile picture (used for authentication), use the Account Settings tab.
          </div>

          <Separator />

          {/* Form Fields */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                disabled={!isEditing}
                id="firstName"
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder="Enter your first name"
                value={formData.firstName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                disabled={!isEditing}
                id="lastName"
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder="Enter your last name"
                value={formData.lastName}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2" htmlFor="email">
              <Mail className="h-4 w-4" />
              Email Address
            </Label>
            <Input
              disabled={!isEditing}
              id="email"
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter your email address"
              type="email"
              value={formData.email}
            />
          </div>

        </CardContent>
      </Card>

      {/* Profile Stats */}
      {profile && (
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your profile details and account information.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{profile.email || betterAuthUser?.email || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Profile Status</p>
                <p className="font-medium text-green-600">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
