import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    const { data: callerProfile, error: profileError } = await ctx.supabase
      .from("user_profiles")
      .select("is_platform_admin")
      .eq("id", ctx.userClaims.id)
      .single();

    if (profileError || !callerProfile || !callerProfile.is_platform_admin) {
      return Response.json(
        { error: "Only platform administrators can bulk-invite users." },
        { status: 403 }
      );
    }

    const { rows } = await req.json();

    if (!Array.isArray(rows) || rows.length === 0) {
      return Response.json({ error: "No rows provided." }, { status: 400 });
    }

    const allowedRoles = ["clinician", "admin"];
    const results = [];
    const orgCache = new Map();

    async function resolveOrganizationId(name) {
      const key = name.trim().toLowerCase();
      if (orgCache.has(key)) return orgCache.get(key);

      const { data: existing } = await ctx.supabaseAdmin
        .from("organizations")
        .select("id, name")
        .ilike("name", name.trim())
        .maybeSingle();

      if (existing) {
        orgCache.set(key, existing.id);
        return existing.id;
      }

      const { data: created, error: createError } = await ctx.supabaseAdmin
        .from("organizations")
        .insert([{ name: name.trim() }])
        .select("id")
        .single();

      if (createError) throw createError;

      orgCache.set(key, created.id);
      return created.id;
    }

    for (const row of rows) {
      const { fullName, email, organizationName, role } = row;

      if (!email || !email.trim() || !organizationName || !organizationName.trim()) {
        results.push({ email, success: false, error: "Missing email or organisation." });
        continue;
      }

      try {
        const organizationId = await resolveOrganizationId(organizationName);
        const assignedRole = allowedRoles.includes(role) ? role : "clinician";

        const { data: inviteData, error: inviteError } =
          await ctx.supabaseAdmin.auth.admin.inviteUserByEmail(email.trim(), {
            data: { full_name: fullName || null },
          });

        if (inviteError) {
          results.push({ email, success: false, error: inviteError.message });
          continue;
        }

        const { error: updateError } = await ctx.supabaseAdmin
          .from("user_profiles")
          .update({
            organization_id: organizationId,
            role: assignedRole,
            full_name: fullName || null,
          })
          .eq("id", inviteData.user.id);

        if (updateError) {
          results.push({ email, success: false, error: updateError.message });
          continue;
        }

        results.push({ email, success: true, organization: organizationName });
      } catch (err) {
        results.push({ email, success: false, error: err.message });
      }
    }

    return Response.json({ results });
  }),
};