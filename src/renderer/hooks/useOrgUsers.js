import { useState, useEffect, useCallback } from "react";
import { supabase } from "../database/supabaseClient.js";

export function useOrgUsers({ isAdmin, isPlatformAdmin, myOrganizationId }) {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(
    myOrganizationId || null
  );
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  const canManage = isAdmin || isPlatformAdmin;

  const loadOrganizations = useCallback(async () => {
    if (!canManage) return;

    const { data, error: orgError } = await supabase
      .from("organizations")
      .select("id, name")
      .order("name", { ascending: true });

    if (orgError) {
      setError(orgError);
      return;
    }

    setOrganizations(data || []);

    setSelectedOrganizationId((current) => {
      if (current) return current;
      if (myOrganizationId) return myOrganizationId;
      return data && data.length > 0 ? data[0].id : null;
    });
  }, [canManage, myOrganizationId]);

  const loadUsers = useCallback(async () => {
    if (!canManage || !selectedOrganizationId) {
      setUsers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: invokeError } = await supabase.functions.invoke(
      "list-org-users",
      { body: { organizationId: selectedOrganizationId } }
    );

    if (invokeError) {
      setError(invokeError);
      setUsers([]);
      setLoading(false);
      return;
    }

    if (data?.error) {
      setError(new Error(data.error));
      setUsers([]);
      setLoading(false);
      return;
    }

    setUsers(data?.users || []);
    setLoading(false);
  }, [canManage, selectedOrganizationId]);

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function updateUserRole(userId, role) {
    setActionError(null);

    const { data, error: invokeError } = await supabase.functions.invoke(
      "update-user-role",
      { body: { userId, role } }
    );

    if (invokeError) {
      setActionError(invokeError.message || "Unable to update role.");
      return false;
    }

    if (data?.error) {
      setActionError(data.error);
      return false;
    }

    await loadUsers();
    return true;
  }

  async function setUserActive(userId, isActive) {
    setActionError(null);

    const { data, error: invokeError } = await supabase.functions.invoke(
      "set-user-active",
      { body: { userId, isActive } }
    );

    if (invokeError) {
      setActionError(invokeError.message || "Unable to update user status.");
      return false;
    }

    if (data?.error) {
      setActionError(data.error);
      return false;
    }

    await loadUsers();
    return true;
  }

  return {
    organizations,
    selectedOrganizationId,
    setSelectedOrganizationId,
    users,
    loading,
    error,
    actionError,
    clearActionError: () => setActionError(null),
    refresh: loadUsers,
    updateUserRole,
    setUserActive,
  };
}