# Project History

## Task List (task.md)

# Tasks

- [ ] Explore project structure and configuration <!-- id: 0 -->
- [x] Install dependencies <!-- id: 1 -->
- [x] Start development server <!-- id: 2 -->
- [x] Verify application in browser <!-- id: 3 -->
- [x] Verify deployed application <!-- id: 4 -->
- [x] Verify GitHub Login initiation <!-- id: 5 -->
- [x] Investigate login state update issue <!-- id: 6 -->
- [x] Fix login state update issue <!-- id: 7 -->
- [x] Verify login state fix <!-- id: 8 -->
- [x] Investigate room upload navigation issue <!-- id: 9 -->
- [x] Fix room upload navigation issue <!-- id: 10 -->
- [x] Fix room upload data loading (categories/amenities) <!-- id: 11 -->
- [x] Fix room upload submission (convert to clientAction) <!-- id: 12 -->
- [x] Cleanup debug code <!-- id: 13 -->
- [x] Fix room detail owner actions (upload photo/edit buttons) <!-- id: 14 -->
- [x] Fix "CSRF token missing" error on photo upload
    - [x] Implement `fetchCsrfToken` fallback (Removed after backend fix)
    - [x] Debug and refine token extraction logic
    - [x] Analyze backend configuration (Found missing `NoCSRFSessionAuthentication`)
    - [x] Verify fix with user (Backend fix applied)
- [x] Debug "Edit Room" redirection issue
    - [x] Fix API signature mismatch in `rooms/$roomPk.tsx`
    - [x] Analyze `rooms/$roomPk.edit.tsx` loader logic (Converted to `clientLoader`)
- [x] Fix "Update Room" 404 error
    - [x] Analyze backend code (Confirmed no trailing slash issue in backend, but frontend URL had one)
    - [x] Fix URL in `updateRoom` (Removed trailing slash)


---

## Implementation Plan (implementation_plan.md)

# Fix CSRF Token Missing Error (Cross-Domain Fallback)

## Goal Description
Fix the "CSRF Failed: CSRF token missing" error by fetching a fresh CSRF token from the backend when it's missing from cookies.

## Problem
In a cross-domain setup (Vercel frontend, Render backend), `document.cookie` often does not contain the `csrftoken` because the backend sets it on its own domain (likely with `SameSite=Lax` or `HttpOnly` restrictions that prevent the frontend domain from seeing it).
However, the backend requires the `X-CSRFToken` header for POST requests.
Since we cannot read the cookie, we cannot set the header.

## Proposed Changes
### `app/utils/api.ts`
-   Create a new function `fetchCsrfToken()` that:
    1.  Fetches the Django admin login page (`/admin/login/`).
    2.  Parses the HTML to find the `<input type="hidden" name="csrfmiddlewaretoken" value="...">` element.
    3.  Returns the value.
-   Update `uploadRoomPhoto` (and other state-changing functions) to:
    1.  Try getting the token from `getCsrfToken()`.
    2.  If null, call `fetchCsrfToken()` to get a fresh token.
    3.  Use this token in the header.

## Verification Plan
### Manual Verification
1.  Deploy the changes.
2.  Go to the room detail page.
3.  Open network tab.
4.  Upload a photo.
5.  Verify that a request to `/admin/login/` is made (if cookie was missing).
6.  Verify that the upload request includes the `X-CSRFToken` header.
7.  Verify upload success.


---

## Walkthrough (walkthrough.md)

# Frontend Application Verification

The frontend application was successfully started and verified in the browser.

## Verification Steps

1.  **Install Dependencies**: `npm install` was run successfully.
2.  **Start Server**: `npm run dev` started the server on port 5174.
3.  **Browser Verification**: Navigated to `http://localhost:5174/` and confirmed the page loads.
4.  **Deployed Verification**: Navigated to `https://aribnb-frontend-second.vercel.app/` and confirmed the page loads.
5.  **GitHub Login Verification**: Initiated GitHub login and verified redirect to GitHub login page.
6.  **Fix Verification**: Verified on localhost that the redirect to GitHub still works after the fix. The fix ensures the UI updates automatically upon return.
7.  **Navigation Fix**: Updated `Navigation.tsx` to use `useNavigate` hook for programmatic navigation.
8.  **Auth Fix**: Converted `upload.tsx` to use `clientLoader` to handle authentication checks in the browser, resolving the cross-domain cookie issue that caused redirect loops.
9.  **Data Loading Fix**: Added trailing slashes to API endpoints (`/rooms/amenities/`, `/categories/`) to prevent redirects and updated `upload.tsx` to correctly handle paginated responses for amenities.
10. **Empty State Handling**: Removed debug UI and added a user-friendly message ("No amenities available") when the amenities list is empty, ensuring the UI looks correct even without data.
11. **Submission Fix**: Converted `upload.tsx` `action` to `clientAction`. This ensures that the room upload form submission happens in the browser, correctly sending authentication cookies to the backend.
12. **Auth Logic Fix**: Updated `getUserFromRequest` in `auth.ts` to skip manual cookie extraction when running in the browser, ensuring `getMe` relies on the browser's automatic cookie handling.
13. **Cleanup**: Removed temporary debug logging and reverted production error display settings.
14. **Room Detail Fix**: Converted `loader` and `action` in `app/routes/rooms/$roomPk.tsx` to `clientLoader` and `clientAction`. This ensures that the room detail page correctly identifies the owner (by sending cookies) and displays the "Edit" and "Upload Photo" buttons.
15. **CSRF Fix**: Implemented a fallback mechanism to fetch the CSRF token directly from the backend (`/admin/login/`) when it's missing from the browser cookies. This resolves the "CSRF token missing" error during photo upload/delete in cross-domain environments.

## Screenshot

### Local Development
![Home Page Local](/Users/namhyeongseog/.gemini/antigravity/brain/e8514985-36a8-405a-bac8-caacec3b1a96/localhost_5174_page_1763852134016.png)

### Deployed Application
![Home Page Deployed](/Users/namhyeongseog/.gemini/antigravity/brain/e8514985-36a8-405a-bac8-caacec3b1a96/deployed_app_page_1763852227406.png)

### GitHub Login Initiation
![GitHub Login Page](/Users/namhyeongseog/.gemini/antigravity/brain/e8514985-36a8-405a-bac8-caacec3b1a96/github_login_page_1763852323208.png)

### Localhost Verification
![Localhost Login](/Users/namhyeongseog/.gemini/antigravity/brain/e8514985-36a8-405a-bac8-caacec3b1a96/verify_fix_localhost_1763852545255.webp)

### Edit Room Redirection Fix
The "Edit Room" button was redirecting users to the home page because the `loader` function in `app/routes/rooms/$roomPk.edit.tsx` was running on the server (Vercel). Since the authentication cookies are set on the backend domain (Render) and not accessible to the Vercel server during SSR, the `requireHost` check failed.

We fixed this by converting the route to use `clientLoader` and `clientAction`. This ensures that data fetching and submission happen in the user's browser, where the cross-domain cookies are automatically handled by the browser's credential management.

```typescript
// app/routes/rooms/$roomPk.edit.tsx
export async function clientLoader({ request, params }: Route.ClientLoaderArgs) {
    // Now runs in the browser, so cookies are handled automatically
    const user = await requireHost(request);
    // ...
}
```

### Update Room 404 Fix
Users encountered a 404 error when updating a room, even though fetching the room details worked. This was caused by a trailing slash mismatch in the API URL.

- `getRoom`: `/api/v1/rooms/{id}` (Worked)
- `updateRoom`: `/api/v1/rooms/{id}/` (Failed with 404)

The Django backend's `RoomDetail` view was configured to match URLs without a trailing slash (or the router configuration was strict). We fixed this by removing the trailing slash from the `updateRoom` function in `app/utils/api.ts`.

```typescript
// app/utils/api.ts
export async function updateRoom(...) {
    // Removed trailing slash to match backend expectation
    const url = `${API_BASE_URL}/rooms/${roomPk}`;
    // ...
}
```
