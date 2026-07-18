import { withSupabase } from "jsr:@supabase/server@^1";

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    const { data: callerProfile, error: profileError } = await ctx.supabase
      .from("user_profiles")
      .select("role, organization_id, is_platform_admin")
      .eq("id", ctx.userClaims.id)
      .single();

    if (profileError || !callerProfile) {
      return Response.json(
        { error: "Unable to verify caller permissions." },
        { status: 403 }
      );
    }

    const isCallerAdmin = callerProfile.role === "admin";
    const isCallerPlatformAdmin = callerProfile.is_platform_admin === true;

    if (!isCallerAdmin && !isCallerPlatformAdmin) {
      return Response.json(
        { error: "Only admins can view organisation users." },
        { status: 403 }
      );
    }

    let organizationId = callerProfile.organization_id;

    if (isCallerPlatformAdmin) {
      let body = {};
      try {
        body = await req.json();
      } catch {
        body = {};
      }
      if (body.organizationId) {
        organizationId = body.organizationId;
      }
    }

    if (!organizationId) {
      return Response.json({ users: [], organizationId: null });
    }

    const { data: profiles, error: profilesError } = await ctx.supabaseAdmin
      .from("user_profiles")
      .select(
        "id, full_name, role, is_platform_admin, is_active, organization_id, created_at"
      )
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: true });

    if (profilesError) {
      return Response.json({ error: profilesError.message }, { status: 500 });
    }

    // user_profiles does not store email — pull it from auth.users via
    // the admin API and merge it in. This is fine at hospital-org scale;
    // if the platform ever grows past a few thousand accounts, replace
    // this bulk list with a paginated or indexed lookup instead.
    const { data: authList, error: authError } =
      await ctx.supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });

    if (authError) {
      return Response.json({ error: authError.message }, { status: 500 });
    }

    const emailById = new Map(authList.users.map((u) => [u.id, u.email]));

    const users = profiles.map((profile) => ({
      ...profile,
      email: emailById.get(profile.id) || null,
    }));

    return Response.json({ users, organizationId });
  }),
};