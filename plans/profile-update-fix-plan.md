# Profile Update Fix Plan

## Problem Statement

Profile data is not being saved when users attempt to update their profile information through the ProfileEditor component.

## Investigation Findings

### 1. Database Schema

- ✅ Users table exists with correct columns: `id`, `email`, `username`, `name`, `bio`, `phone_number`, `avatar_url`, `created_at`
- ✅ All required columns for profile updates are present
- ✅ Direct SQL updates work correctly

### 2. RLS Policies

- ✅ "Users can update their own profile" policy exists
- ✅ Policy condition: `auth.uid() = id`
- ✅ No RLS blocking identified

### 3. Code Implementation

#### updateProfile function (AppContext.tsx)

- ✅ Correct field mapping:
  - `name` → `name`
  - `username` → `username`
  - `bio` → `bio`
  - `phone` → `phone_number`
  - `avatar` → `avatar_url`
- ✅ Error logging to console
- ✅ Local state update on success

#### ProfileEditor component

- ✅ Form validation for required fields
- ✅ Error state management
- ❌ Generic error message: "Failed to update profile. Username might be taken."
- ❌ No detailed error information shown to user

## Potential Root Causes

### 1. Username Uniqueness Constraint

- Database has UNIQUE constraint on `username` column
- Error message suggests this is the suspected issue
- Need to check if username is being changed to an existing one

### 2. Authentication/Session Issues

- User might not be properly authenticated
- Session might have expired
- `auth.uid()` might not match user ID

### 3. Error Handling Limitations

- Errors are logged to console but not displayed meaningfully
- Generic error message hides actual problem
- No validation feedback before submission

### 4. Data Type Mismatches

- Phone number format validation
- Bio length constraints
- Name character limits

## Solution Plan

### Phase 1: Improved Error Handling & Logging

1. **Enhance updateProfile function error logging**
   - Log full error object with details
   - Include which fields are being updated
   - Log user ID and session status

2. **Improve ProfileEditor error display**
   - Show specific error messages based on error type
   - Display database constraint violations clearly
   - Add validation feedback before submission

### Phase 2: Validation & Pre-checks

3. **Add username uniqueness validation**
   - Check if username exists before attempting update
   - Provide immediate feedback in UI
   - Allow case-insensitive checks

4. **Verify authentication state**
   - Confirm user is authenticated before update
   - Check session validity
   - Provide re-authentication flow if needed

### Phase 3: Testing & Verification

5. **Test with different field combinations**
   - Update only name
   - Update only bio
   - Update only phone
   - Update only avatar
   - Update all fields together

6. **Implement fallback strategies**
   - Retry mechanism for transient errors
   - Offline capability consideration
   - Partial update support

## Implementation Steps

### Step 1: Update updateProfile function

```typescript
const updateProfile = async (updates: Partial<User>) => {
  if (!user) {
    console.error("[Auth] updateProfile: No user found");
    throw new Error("Not authenticated");
  }

  console.log("[Auth] updateProfile: Updating user", user.id, "with", updates);

  const dbUpdates: any = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.username !== undefined) dbUpdates.username = updates.username;
  if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
  if (updates.phone !== undefined) dbUpdates.phone_number = updates.phone;
  if (updates.avatar !== undefined) dbUpdates.avatar_url = updates.avatar;

  try {
    const { error, data } = await supabase
      .from("users")
      .update(dbUpdates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("[Auth] updateProfile Error:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        updates: dbUpdates,
      });

      // Map common error codes to user-friendly messages
      if (error.code === "23505") {
        // Unique violation
        if (error.message.includes("username")) {
          throw new Error("Username is already taken. Please choose another.");
        }
      }
      throw error;
    }

    console.log("[Auth] updateProfile: Success", data);
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
    return data;
  } catch (err: any) {
    console.error("[Auth] updateProfile Exception:", err);
    throw err;
  }
};
```

### Step 2: Update ProfileEditor error handling

```typescript
// In handleSave function
try {
  await updateProfile({
    name: formData.name,
    username: formData.username,
    bio: formData.bio,
    phone: formData.phone,
  });
  onClose();
} catch (err: any) {
  console.error("Profile update failed:", err);

  // User-friendly error messages
  if (err.message.includes("Username is already taken")) {
    setError("Username is already taken. Please choose another.");
  } else if (err.message.includes("Not authenticated")) {
    setError("Your session has expired. Please log in again.");
  } else if (err.code === "23505") {
    setError("A database constraint was violated. Please check your input.");
  } else {
    setError(`Failed to update profile: ${err.message || "Unknown error"}`);
  }
}
```

### Step 3: Add username availability check

```typescript
const checkUsernameAvailability = async (username: string) => {
  if (!user || username === user.username) return true;

  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  return !data; // Available if no user found
};
```

## Testing Strategy

1. **Unit Tests**: Test updateProfile function with various inputs
2. **Integration Tests**: Test full profile update flow
3. **Edge Cases**:
   - Empty required fields
   - Very long bio/text
   - Special characters in username
   - Duplicate username attempts
   - Network failures during update

## Success Criteria

- Profile updates succeed with appropriate feedback
- Users see clear error messages when updates fail
- Username conflicts are handled gracefully
- Session issues are detected and handled
- Console logs provide sufficient debugging information

## Timeline & Priority

**Priority: High** - This blocks user profile management functionality
**Estimated Effort**: 2-3 hours for implementation and testing

## Next Steps

1. Review browser console errors from user
2. Implement Phase 1 improvements
3. Test with actual user scenarios
4. Deploy fixes and monitor
