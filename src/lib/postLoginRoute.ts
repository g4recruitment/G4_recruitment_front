// Shared post-login routing decision.
//
// The "where do we send the user after Google auth resolves" branching was
// duplicated almost verbatim in Login.tsx and AuthCallback.tsx. This keeps the
// decision in one place; callers own the side effects (navigate, toast,
// clearing the localStorage flags they read).

export interface PostLoginContext {
    role: string;
    exists: boolean;
    /** From the "Log in as Admin" button (localStorage `isAdminLoginAttempt`). */
    isAdminLoginAttempt: boolean;
    /** Pending driver type chosen before auth (localStorage `pendingDriverType`). */
    pendingType: string | null;
}

export type ToastKind = "success" | "error" | "info";

export type PostLoginDecision =
    | { kind: "navigate"; path: string; toast?: { type: ToastKind; message: string } }
    // Login-only outcome: verified account with no pending type — let the user pick.
    | { kind: "selectType"; toast: { type: ToastKind; message: string } };

export function resolvePostLoginRoute(ctx: PostLoginContext): PostLoginDecision {
    const { role, exists, isAdminLoginAttempt, pendingType } = ctx;

    // Enforcement for the explicit "Log in as Admin" flow.
    if (isAdminLoginAttempt) {
        return role === "admin"
            ? { kind: "navigate", path: "/admin", toast: { type: "success", message: "Welcome, Administrator" } }
            : { kind: "navigate", path: "/profile", toast: { type: "error", message: "Only an admin can enter the dashboard" } };
    }

    // Admins always land on the dashboard.
    if (role === "admin") {
        return { kind: "navigate", path: "/admin" };
    }

    // Existing application → profile. Checked BEFORE pendingType so a stale
    // `pendingDriverType` in localStorage can't bounce a registered user back
    // into the registration flow (this was a latent bug in the old AuthCallback
    // ordering, which checked pendingType first).
    if (exists) {
        return { kind: "navigate", path: "/profile" };
    }

    // No application yet but a type was chosen — resume registration.
    if (pendingType) {
        return {
            kind: "navigate",
            path: pendingType === "luxury" ? "/register/luxury" : "/register/regular",
        };
    }

    // Verified but nothing chosen yet — Login shows the selection screen.
    return {
        kind: "selectType",
        toast: { type: "info", message: "Account verified. Please select a driver type to continue." },
    };
}
