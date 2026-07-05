import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    // ctx.supabase is scoped to the calling user's own RLS permissions —
    // this lookup will only ever return the caller's own profile row.
    const { data: callerProfile, error: profileError } = await ctx.supabase
      .from("user_profiles")
      .select("role, organization_id")
      .eq("id", ctx.userClaims.sub)
      .single();

    if (profileError || !callerProfile || callerProfile.role !== "admin") {
      return Response.json(
        { error: "Only admins can invite users." },
        { status: 403 }
      );
    }

    const { email, fullName, role } = await req.json();

    if (!email || !email.trim()) {
      return Response.json({ error: "Email is required." }, { status: 400 });
    }

    const allowedRoles = ["clinician", "admin"];
    const assignedRole = allowedRoles.includes(role) ? role : "clinician";

    // ctx.supabaseAdmin bypasses RLS — required to invite a new auth user
    // and to create/update a profile row that isn't the caller's own.
    const { data: inviteData, error: inviteError } =
      await ctx.supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: { full_name: fullName || null },
      });

    if (inviteError) {
      return Response.json({ error: inviteError.message }, { status: 400 });
    }

    const invitedUserId = inviteData.user.id;

    // The handle_new_user() trigger already created a bare user_profiles row.
    // Update it with the correct organization and role.
    const { error: updateError } = await ctx.supabaseAdmin
      .from("user_profiles")
      .update({
        organization_id: callerProfile.organization_id,
        role: assignedRole,
        full_name: fullName || null,
      })
      .eq("id", invitedUserId);

    if (updateError) {
      return Response.json({ error: updateError.message }, { status: 500 });
    }

    return Response.json({ success: true, userId: invitedUserId });
  }),
};