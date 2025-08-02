# Updated User Authentication Flow

## Overview
The new user authentication flow has been redesigned to provide a smoother onboarding experience with step-by-step profile completion.

## User Flow Steps

### 1. Email Verification (Send OTP)
**Endpoint:** `POST /auth/send-otp`
```json
{
  "email": "user@example.com"
}
```
**Response:**
```json
{
  "message": "OTP sent successfully to your email"
}
```

### 2. OTP Verification
**Endpoint:** `POST /auth/verify-otp`
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response for New User:**
```json
{
  "accessToken": "jwt-token-here",
  "isNew": true
}
```

**Response for Existing User:**
```json
{
  "accessToken": "jwt-token-here",
  "isNew": false,
  "user": {
    "id": "uuid",
    "fullName": "John Doe",
    "email": "user@example.com",
    "phoneNumber": "+1234567890",
    "zipCode": "12345",
    "role": "donor",
    "status": "completed",
    "profilePicture": "https://...",
    "description": "Optional description"
  }
}
```

### 3. Complete Profile (For New Users)
**Endpoint:** `POST /auth/complete-profile`
**Headers:** `Authorization: Bearer {accessToken}`
```json
{
  "fullName": "John Doe",
  "phoneNumber": "+1234567890",
  "zipCode": "12345",
  "profilePicture": "https://example.com/pic.jpg" // optional
}
```

**Response:**
```json
{
  "message": "Profile completed successfully",
  "user": {
    "id": "uuid",
    "fullName": "John Doe",
    "email": "user@example.com",
    "phoneNumber": "+1234567890",
    "zipCode": "12345",
    "status": "role_selection_pending",
    "profilePicture": "https://..."
  }
}
```

### 4. Set User Role (Final Step)
**Endpoint:** `POST /auth/set-role`
**Headers:** `Authorization: Bearer {accessToken}`
```json
{
  "role": "donor", // or "buyer"
  "description": "I am a new mother looking to help other mothers." // optional
}
```

**Response:**
```json
{
  "message": "User role set successfully",
  "user": {
    "id": "uuid",
    "fullName": "John Doe",
    "email": "user@example.com",
    "phoneNumber": "+1234567890",
    "zipCode": "12345",
    "role": "donor",
    "status": "completed",
    "profilePicture": "https://...",
    "description": "I am a new mother looking to help other mothers."
  }
}
```

## User Status States

1. **email_verification_pending** - User created but email not verified
2. **profile_incomplete** - Email verified but profile not completed
3. **role_selection_pending** - Profile completed but role not selected
4. **completed** - Fully onboarded user

## Database Changes

### User Entity Updates
- `fullName`: Now nullable for new flow
- `phoneNumber`: Now nullable for new flow  
- `zipCode`: Now nullable for new flow
- `role`: Now nullable for new flow
- `status`: New enum field to track user onboarding state
- `description`: New optional text field

### Migration
Run the migration to update the database schema:
```bash
npm run migration:run
```

## Frontend Implementation Guide

### 1. Login/Register Screen
- Single email input
- "Send OTP" button
- Calls `POST /auth/send-otp`

### 2. OTP Verification Screen
- OTP input field
- Calls `POST /auth/verify-otp`
- If `isNew: true` → go to profile completion
- If `isNew: false` → check user.status:
  - If `completed` → go to main app
  - If `profile_incomplete` → go to profile completion
  - If `role_selection_pending` → go to role selection

### 3. Profile Completion Screen (for new users)
- Name, phone, zip code inputs
- Optional profile picture
- Calls `POST /auth/complete-profile`

### 4. Role Selection Screen
- Donor/Buyer selection
- Optional description textarea
- Calls `POST /auth/set-role`
- Redirect to main app

## Benefits

1. **Smoother UX**: Step-by-step onboarding instead of one large form
2. **Early Access**: Users get access token after email verification
3. **Flexible**: Existing users can login directly
4. **Trackable**: Clear status tracking for incomplete registrations
5. **Extensible**: Easy to add more steps in the future

## Security Considerations

1. OTP expires in 10 minutes
2. JWT tokens are required for profile completion steps
3. Status validation prevents skipping steps
4. Email verification is mandatory before any profile actions
