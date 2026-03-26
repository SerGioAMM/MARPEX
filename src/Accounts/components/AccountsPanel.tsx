import { useState } from "react";
import type { Platform } from "../../Main/interfaces/tablePlatform";
import type { Status } from "../../Main/interfaces/tableStatus";
import { useAccountsPanel } from "../hooks/useAccountsPanel";
import { supabase } from "../../Main/actions/supabaseClient";
import "../../index.css";
import "../../style.css";

// ─── Accounts Panel ──────────────────────────────────────────────────────────
export function AccountsPanel({
  platform,
  statuses,
  onBack,
}: {
  platform: Platform;
  statuses: Status[];
  onBack: () => void;
}) {
  const {
    setAccounts,
    newEmail,
    setNewEmail,
    newPass,
    setNewPass,
    search,
    setSearch,
    editing,
    setEditing,
    loading,
    addAccount,
    deleteAccount,
    saveAccount,
    addProfile,
    updateProfile,
    deleteProfile,
    filtered,
  } = useAccountsPanel({ platform, statuses });

  const [clientNameDrafts, setClientNameDrafts] = useState<
    Record<number, string>
  >({});

  return (
    <>
      <button className="back-btn" onClick={onBack}>
        ← Volver
      </button>
      <div className="section-title">{platform.name} — Cuentas</div>

      <div className="add-form">
        <input
          placeholder="Correo de la cuenta"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
        />
        <input
          placeholder="Contraseña"
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
        />
        <button
          className="btn-main"
          style={{ width: "100%", height: "40px", fontSize: "15px" }}
          onClick={addAccount}
        >
          Guardar Cuenta
        </button>
      </div>

      <input
        className="search-input"
        placeholder="🔍 Buscar cuenta..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && <div className="loading">Cargando cuentas...</div>}
      {!loading && filtered.length === 0 && (
        <div className="empty-state">No hay cuentas registradas</div>
      )}

      {filtered.map((acc, idx) => {
        const isEditing = editing[acc.id] ?? false;
        return (
          <div key={acc.id} className="account-card">
            <div className="account-num">#{idx + 1}</div>
            <div className="account-top">
              <button
                className="btn-icon"
                onClick={() => {
                  if (isEditing) saveAccount(acc);
                  else setEditing((e) => ({ ...e, [acc.id]: true }));
                }}
              >
                {isEditing ? "💾" : "✏️"}
              </button>
              <button
                className="btn-icon danger"
                onClick={() => deleteAccount(acc.id)}
              >
                ✕
              </button>
            </div>
            <input
              className="account-field"
              disabled={!isEditing}
              value={acc.email}
              onChange={(e) =>
                setAccounts((prev) =>
                  prev.map((a) =>
                    a.id === acc.id ? { ...a, email: e.target.value } : a,
                  ),
                )
              }
              placeholder="Correo"
            />
            <input
              className="account-field"
              disabled={!isEditing}
              value={acc.password}
              onChange={(e) =>
                setAccounts((prev) =>
                  prev.map((a) =>
                    a.id === acc.id ? { ...a, password: e.target.value } : a,
                  ),
                )
              }
              placeholder="Contraseña"
            />
            <div className="profiles-section">
              <div className="profile-row profile-header">
                <div>Perfil</div>
                <div>Cliente</div>
                <div>Estado</div>
                <div></div>
              </div>
              {(acc.profiles ?? []).map((prof) => {
                const statusName =
                  statuses
                    .find((s) => s.id === prof.status_id)
                    ?.name?.toLowerCase() ?? "";
                const rowClassName = `profile-row profile-status-${statusName}`;
                const currentClientName =
                  clientNameDrafts[prof.id] ?? prof.client_name ?? "";
                return (
                  <div key={prof.id} className={rowClassName}>
                    <input
                      className="profile-input"
                      value={prof.name}
                      placeholder="Nombre"
                      onChange={(e) => {
                        const updated = { ...prof, name: e.target.value };
                        setAccounts((prev) =>
                          prev.map((a) =>
                            a.id === acc.id
                              ? {
                                  ...a,
                                  profiles: a.profiles?.map((p) =>
                                    p.id === prof.id ? updated : p,
                                  ),
                                }
                              : a,
                          ),
                        );
                      }}
                      onBlur={() => updateProfile(prof)}
                    />
                    <input
                      className="profile-input"
                      value={currentClientName}
                      placeholder="Cliente"
                      onChange={(e) => {
                        const nameValue = e.target.value;
                        setClientNameDrafts((prev) => ({
                          ...prev,
                          [prof.id]: nameValue,
                        }));
                        const updated = { ...prof, client_name: nameValue };
                        setAccounts((prev) =>
                          prev.map((a) =>
                            a.id === acc.id
                              ? {
                                  ...a,
                                  profiles: a.profiles?.map((p) =>
                                    p.id === prof.id ? updated : p,
                                  ),
                                }
                              : a,
                          ),
                        );
                      }}
                      onBlur={() => {
                        const nameValue =
                          clientNameDrafts[prof.id] ?? prof.client_name ?? "";
                        const updated = { ...prof, client_name: nameValue };
                        setAccounts((prev) =>
                          prev.map((a) =>
                            a.id === acc.id
                              ? {
                                  ...a,
                                  profiles: a.profiles?.map((p) =>
                                    p.id === prof.id ? updated : p,
                                  ),
                                }
                              : a,
                          ),
                        );
                        setClientNameDrafts((prev) => ({
                          ...prev,
                          [prof.id]: nameValue,
                        }));
                        updateProfile(updated);
                      }}
                    />
                    <select
                      className="profile-select"
                      value={prof.status_id}
                      onChange={async (e) => {
                        const updated = {
                          ...prof,
                          status_id: parseInt(e.target.value),
                        };
                        setAccounts((prev) =>
                          prev.map((a) =>
                            a.id === acc.id
                              ? {
                                  ...a,
                                  profiles: a.profiles?.map((p) =>
                                    p.id === prof.id ? updated : p,
                                  ),
                                }
                              : a,
                          ),
                        );
                        await supabase
                          .from("profiles")
                          .update({ status_id: updated.status_id })
                          .eq("id", prof.id);
                      }}
                    >
                      {statuses.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <button
                      className="btn-del-sm"
                      onClick={() => deleteProfile(prof.id)}
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
            <button
              className="btn-add-profile"
              onClick={() => addProfile(acc.id)}
            >
              + Agregar Perfil
            </button>
          </div>
        );
      })}
    </>
  );
}
