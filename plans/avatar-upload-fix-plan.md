# Avatar Upload Fix Plan

## Problem Statement

Users cannot upload their avatars and see an error message when attempting to do so.

## Root Cause Analysis

### Current Implementation Review

1. **ProfileEditor Component**: Handles avatar file selection and calls `uploadAvatar`
2. **uploadAvatar Function** (AppContext.tsx): Uploads file to Supabase Storage `avatars` bucket
3. **Storage Configuration**: `avatars` bucket exists with RLS policies
4. **Error Handling**: Generic error messages, poor error propagation

### Identified Issues

#### 1. Error Handling Deficiencies

- `uploadAvatar` returns `null` on error without details
- UI shows generic "Failed to upload avatar." message
- No distinction between different error types (network, RLS, validation, etc.)
- Errors logged to console but not shown to user

#### 2. Potential RLS Policy Issues

- Policy requires path format: `{user_id}/avatar.{ext}`
- `uploadAvatar` creates path: `${user.id}/avatar.${fileExt}`
- Need to verify `user.id` matches `auth.uid()` format

#### 3. Validation Gaps

- Frontend validates file type and size (5MB limit)
- No validation of user authentication state before upload
- No retry mechanism for transient failures

#### 4. URL Generation Concern

- `getPublicUrl` returns URL with timestamp parameter `?t=...`
- May cause issues with URL parsing in Avatar component

## Solution Architecture

### Phase 1: Enhanced Error Handling & Logging

#### 1.1 Update `uploadAvatar` Function

```typescript
const uploadAvatar = async (file: File): Promise<string> => {
  if (!user) {
    throw new Error("Not authenticated. Please log in again.");
  }

  // Validate file
  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload an image file (JPEG, PNG, GIF, etc.).");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image must be less than 5MB.");
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}/avatar.${fileExt}`;

  console.log("[Storage] Uploading avatar:", {
    userId: user.id,
    fileName,
    fileSize: file.size,
    fileType: file.type,
  });

  try {
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("[Storage] uploadAvatar Error:", uploadError);

      // Map common storage errors to user-friendly messages
      if (uploadError.message.includes("bucket")) {
        throw new Error(
          "Storage bucket not configured. Please contact support.",
        );
      } else if (uploadError.message.includes("permission")) {
        throw new Error("You do not have permission to upload avatars.");
      } else if (uploadError.message.includes("size")) {
        throw new Error("File size exceeds limit.");
      } else {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
    return data.publicUrl;
  } catch (err: any) {
    console.error("[Storage] uploadAvatar Exception:", err);
    throw err;
  }
};
```

#### 1.2 Update ProfileEditor Error Handling

```typescript
const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setError(null);
  setIsUploading(true);

  try {
    const publicUrl = await uploadAvatar(file);
    if (publicUrl) {
      await updateProfile({ avatar: publicUrl });
      // Show success feedback
      setError("Avatar updated successfully!");
      setTimeout(() => setError(null), 3000);
    }
  } catch (err: any) {
    console.error("Avatar upload failed:", err);
    setError(err.message || "Failed to upload avatar.");
  } finally {
    setIsUploading(false);
    // Clear file input to allow re-upload of same file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }
};
```

### Phase 2: Validation & Pre-flight Checks

#### 2.1 Add Authentication Check

```typescript
// Before attempting upload, verify user is authenticated
const checkAuth = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("Session expired. Please log in again.");
  }
  return session.user.id;
};
```

#### 2.2 Add Storage Availability Check

```typescript
const checkStorageBucket = async () => {
  const { data, error } = await supabase.storage.getBucket("avatars");
  if (error) {
    console.error("[Storage] Bucket check failed:", error);
    throw new Error("Avatar storage is not available.");
  }
  return data;
};
```

### Phase 3: UI/UX Improvements

#### 3.1 Better Error Display

- Show specific error messages with icons
- Add retry button for network errors
- Show file validation errors immediately

#### 3.2 Loading States

- Show progress indicator during upload
- Disable upload button while processing
- Provide visual feedback on success

#### 3.3 File Preview

- Show preview of selected image before upload
- Allow crop/resize before upload
- Validate image dimensions

### Phase 4: Testing Strategy

#### 4.1 Test Cases

1. **Happy Path**: Valid image upload
2. **File Validation**: Invalid file types, oversized files
3. **Authentication**: Upload without session, expired session
4. **Network Issues**: Slow connection, timeout, offline
5. **Storage Issues**: Bucket not found, RLS policy violations
6. **Concurrent Uploads**: Multiple rapid upload attempts

#### 4.2 Integration Tests

- Mock Supabase client for unit tests
- E2E test with Cypress for upload flow
- Load testing for large files

## Implementation Priority

### Immediate (High Impact)

1. Enhanced error handling in `uploadAvatar`
2. Better error messages in ProfileEditor
3. Session validation before upload

### Short-term (Medium Impact)

1. Storage availability check
2. File preview feature
3. Retry mechanism

### Long-term (Low Impact)

1. Image cropping/resizing
2. Advanced file validation (dimensions, EXIF stripping)
3. Upload progress indicator
4. Offline upload queue

## Risk Mitigation

### Technical Risks

1. **RLS Policy Mismatch**: Test with actual user session
2. **Storage Quota**: Implement file size limits and cleanup
3. **CORS Issues**: Verify bucket CORS configuration
4. **CDN Caching**: Handle cache invalidation for updated avatars

### User Experience Risks

1. **Slow Uploads**: Implement progress feedback
2. **Failed Uploads**: Clear error messages and recovery options
3. **Multiple Devices**: Handle avatar sync across devices

## Success Metrics

1. Avatar upload success rate > 95%
2. User-reported upload issues reduced by 80%
3. Average upload time < 5 seconds for 1MB images
4. Error message clarity score (user survey)

## Rollout Plan

1. **Week 1**: Implement Phase 1 (error handling)
2. **Week 2**: Implement Phase 2 (validation)
3. **Week 3**: Implement Phase 3 (UI improvements)
4. **Week 4**: Testing and bug fixes
5. **Week 5**: Production deployment with feature flag

## Dependencies

1. Supabase Storage configuration
2. React state management updates
3. Testing framework setup
4. Monitoring and logging tools

## Appendix

### Current RLS Policies (Verified)

```sql
-- Public avatars are viewable by everyone
CREATE POLICY "Public avatars are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Users can upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated' AND
  (string_to_array(name, '/'))[1] = (auth.uid())::text
);

-- Users can update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated' AND
  (string_to_array(name, '/'))[1] = (auth.uid())::text
);

-- Users can delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated' AND
  (string_to_array(name, '/'))[1] = (auth.uid())::text
);
```

### File Path Format

```
{user_uuid}/avatar.{extension}
Example: f5cf7bf2-5204-41ad-a747-9e74329ce78e/avatar.jpg
```

### Error Code Mapping

| Error Type         | User Message                                               | Action                    |
| ------------------ | ---------------------------------------------------------- | ------------------------- |
| No session         | "Your session has expired. Please log in again."           | Redirect to login         |
| File too large     | "Image must be less than 5MB."                             | Show size limit           |
| Invalid file type  | "Please upload an image file (JPEG, PNG, GIF)."            | Show accepted formats     |
| Storage permission | "You don't have permission to upload avatars."             | Check RLS policies        |
| Network error      | "Network connection failed. Please check your internet."   | Offer retry               |
| Bucket not found   | "Avatar storage is not available. Please contact support." | Log admin alert           |
| Unknown error      | "Something went wrong. Please try again."                  | Log details for debugging |
