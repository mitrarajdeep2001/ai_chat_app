# Phase 1 Implementation Checklist

## File: `src/context/AppContext.tsx`

### 1. Enhanced updateProfile function

- [ ] Add authentication check with proper error
- [ ] Add detailed logging of update attempt
- [ ] Improve error handling with specific error codes
- [ ] Add user-friendly error message mapping
- [ ] Return updated data on success

### 2. Code Changes Needed:

```typescript
// Current function (lines 297-315)
const updateProfile = async (updates: Partial<User>) => {
  if (!user) return;

  const dbUpdates: any = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.username !== undefined) dbUpdates.username = updates.username;
  if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
  if (updates.phone !== undefined) dbUpdates.phone_number = updates.phone;
  if (updates.avatar !== undefined) dbUpdates.avatar_url = updates.avatar;

  const { error } = await supabase
    .from("users")
    .update(dbUpdates)
    .eq("id", user.id);

  if (!error) {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  } else {
    console.error("[Auth] updateProfile Error:", error);
    throw error;
  }
};

// Enhanced version
const updateProfile = async (updates: Partial<User>) => {
  if (!user) {
    console.error("[Auth] updateProfile: No user found in context");
    throw new Error("Not authenticated. Please log in again.");
  }

  console.log(
    "[Auth] updateProfile: Updating user",
    user.id,
    "with fields:",
    updates,
  );

  const dbUpdates: any = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.username !== undefined) dbUpdates.username = updates.username;
  if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
  if (updates.phone !== undefined) dbUpdates.phone_number = updates.phone;
  if (updates.avatar !== undefined) dbUpdates.avatar_url = updates.avatar;

  // Check if there are actually updates to make
  if (Object.keys(dbUpdates).length === 0) {
    console.log("[Auth] updateProfile: No fields to update");
    return;
  }

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
        userId: user.id,
      });

      // Map common error codes to user-friendly messages
      if (error.code === "23505") {
        // Unique violation
        if (error.message.includes("username")) {
          throw new Error("Username is already taken. Please choose another.");
        } else if (error.message.includes("email")) {
          throw new Error("Email is already registered.");
        }
      } else if (error.code === "42501") {
        // Insufficient privilege
        throw new Error("You do not have permission to update this profile.");
      } else if (error.message.includes("JWT")) {
        throw new Error("Your session has expired. Please log in again.");
      }

      throw new Error(
        `Failed to update profile: ${error.message || "Unknown error"}`,
      );
    }

    console.log("[Auth] updateProfile: Successfully updated user", data);
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
    return data;
  } catch (err: any) {
    console.error("[Auth] updateProfile Exception:", err);
    throw err;
  }
};
```

## File: `src/features/settings/ProfileEditor.tsx`

### 1. Enhanced error handling in handleSave

- [ ] Update error state with specific error messages
- [ ] Add error type detection
- [ ] Improve user feedback

### 2. Code Changes Needed:

```typescript
// Current error handling (lines 72-77)
} catch (err: any) {
  console.error(err);
  setError('Failed to update profile. Username might be taken.');
}

// Enhanced version
} catch (err: any) {
  console.error('Profile update failed:', err);

  // Extract meaningful error message
  let errorMessage = 'Failed to update profile.';

  if (err.message) {
    if (err.message.includes('Username is already taken')) {
      errorMessage = 'Username is already taken. Please choose another.';
    } else if (err.message.includes('session has expired')) {
      errorMessage = 'Your session has expired. Please log in again.';
    } else if (err.message.includes('do not have permission')) {
      errorMessage = 'You do not have permission to update this profile.';
    } else if (err.message.includes('Not authenticated')) {
      errorMessage = 'You are not logged in. Please log in to update your profile.';
    } else {
      // Use the error message if it's user-friendly
      errorMessage = err.message;
    }
  }

  setError(errorMessage);
}
```

### 3. Add username availability check (optional enhancement)

- [ ] Add real-time username validation
- [ ] Debounce API calls
- [ ] Visual feedback for username availability

## Testing Plan

### 1. Test Scenarios

- [ ] Update profile with valid data
- [ ] Attempt to update with existing username
- [ ] Update with expired session
- [ ] Update with missing required fields
- [ ] Update only specific fields (name only, bio only, etc.)

### 2. Verification Steps

- [ ] Check browser console for detailed logs
- [ ] Verify database is updated correctly
- [ ] Confirm UI reflects changes immediately
- [ ] Test error messages are user-friendly
- [ ] Verify session handling works correctly

## Rollback Plan

If issues arise:

1. Revert to original updateProfile function
2. Keep enhanced error handling in ProfileEditor
3. Add more logging for debugging
4. Test with simpler implementation first

## Success Metrics

- Profile updates succeed with appropriate feedback
- Error messages are specific and actionable
- Console logs provide sufficient debugging info
- No regression in existing functionality
