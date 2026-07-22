import { useState } from "react";
import { useOrgUsers } from "../hooks/useOrgUsers.js";
import { useConfirm } from "../components/feedback/ConfirmContext.jsx";
import { useToast } from "../components/feedback/ToastContext.jsx";

const ROLE_LABELS = {
  clinician: "Clinician",
  admin: "Admin",
};

export default function AdministrationPage({
  isAdmin,
  isPlatformAdmin,
  myOrganizationId,
  currentUserId,
  onInviteUser,
  onBulkInvite,
}) {
  const {
    organizations,
    selectedOrganizationId,
    setSelectedOrganizationId,
    users,
    loading,
    error,
    actionError,
    clearActionError,
    updateUserRole,
    setUserActive,
  } = useOrgUsers({ isAdmin, isPlatformAdmin, myOrganizationId });

  const confirm = useConfirm();
  const toast = useToast();
  const [pendingUserId, setPendingUserId] = useState(null);

  const selectedOrganization = organizations.find(
    (org) => org.id === selectedOrganizationId
  );

  async function handleRoleChange(userId, role) {
    setPendingUserId(userId);
    const ok = await updateUserRole(userId, role);
    setPendingUserId(null);
    if (ok) {
      toast.success("User role updated.");
    }
  }

  async function handleActiveToggle(user) {
    const deactivating = user.is_active;

    const ok = await confirm({
      title: deactivating ? "Deactivate user?" : "Reactivate user?",
      message: deactivating
        ? `${user.full_name || user.email || "This user"} will immediately lose access to the platform.`
        : `${user.full_name || user.email || "This user"} will regain access to the platform.`,
      confirmLabel: deactivating ? "Deactivate" : "Reactivate",
      danger: deactivating,
    });

    if (!ok) return;

    setPendingUserId(user.id);
    const success = await setUserActive(user.id, !user.is_active);
    setPendingUserId(null);

    if (success) {
      toast.success(deactivating ? "User deactivated." : "User reactivated.");
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Administration</h1>
          <p className="page-subtitle">
            Manage user access{" "}
            {isPlatformAdmin ? "across organisations" : "for your organisation"}.
          </p>
        </div>

        <div className="admin-page-actions">
          {isAdmin && (
            <button type="button" className="secondary" onClick={onInviteUser}>
              Invite User
            </button>
          )}
          {isPlatformAdmin && (
            <button type="button" className="secondary" onClick={onBulkInvite}>
              Bulk Invite
            </button>
          )}
        </div>
      </div>

      {isPlatformAdmin && organizations.length > 1 && (
        <div className="admin-org-selector">
          <label className="field-label" htmlFor="admin-org-select">
            Organisation
          </label>
          <select
            id="admin-org-select"
            value={selectedOrganizationId || ""}
            onChange={(event) => setSelectedOrganizationId(event.target.value)}
          >
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {!isPlatformAdmin && selectedOrganization && (
        <p className="page-description">{selectedOrganization.name}</p>
      )}

      {actionError && (
        <div className="admin-error-banner">
          <span>{actionError}</span>
          <button type="button" className="secondary" onClick={clearActionError}>
            Dismiss
          </button>
        </div>
      )}

      {loading && <p>Loading users...</p>}

      {!loading && error && (
        <p className="form-error">
          Unable to load users: {error.message || "Unknown error."}
        </p>
      )}

      {!loading && !error && users.length === 0 && (
        <section>
          <p>No users found for this organisation.</p>
        </section>
      )}

      {!loading && !error && users.length > 0 && (
        <section>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isSelf = user.id === currentUserId;
                const isPending = pendingUserId === user.id;

                return (
                  <tr key={user.id}>
                    <td>{user.full_name || "—"}</td>
                    <td>{user.email || "—"}</td>
                    <td>
                      {user.is_platform_admin ? (
                        <span title="Platform Administrator">
                          Platform Admin
                        </span>
                      ) : (
                        <select
                          value={user.role}
                          disabled={isSelf || isPending}
                          onChange={(event) =>
                            handleRoleChange(user.id, event.target.value)
                          }
                        >
                          {Object.entries(ROLE_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          user.is_active ? "status-completed" : "status-cancelled"
                        }`}
                      >
                        {user.is_active ? "Active" : "Deactivated"}
                      </span>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        type="button"
                        className="secondary"
                        disabled={isSelf || isPending}
                        onClick={() => handleActiveToggle(user)}
                      >
                        {user.is_active ? "Deactivate" : "Reactivate"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}