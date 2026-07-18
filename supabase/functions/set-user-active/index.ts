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
        { error: "Only admins can change user status." },
        { status: 403 }
      );
    }

    const { userId, isActive } = await req.json();

    if (!userId) {
      return Response.json({ error: "userId is required." }, { status: 400 });
    }

    if (typeof isActive !== "boolean") {
      return Response.json(
        { error: "isActive must be true or false." },
        { status: 400 }
      );
    }

    if (userId === ctx.userClaims.id) {
      return Response.json(
        { error: "You cannot deactivate your own account." },
        { status: 400 }
      );
    }

    const { data: targetProfile, error: targetError } = await ctx.supabaseAdmin
      .from("user_profiles")
      .select("organization_id")
      .eq("id", userId)
      .single();

    if (targetError || !targetProfile) {
      return Response.json({ error: "User not found." }, { status: 404 });
    }

    if (
      !isCallerPlatformAdmin &&
      targetProfile.organization_id !== callerProfile.organization_id
    ) {
      return Response.json(
        { error: "You can only manage users in your own organisation." },
        { status: 403 }
      );
    }

    const { error: updateError } = await ctx.supabaseAdmin
      .from("user_profiles")
      .update({ is_active: isActive })
      .eq("id", userId);

    if (updateError) {
      return Response.json({ error: updateError.message }, { status: 500 });
    }

    return Response.json({ success: true });
  }),
};