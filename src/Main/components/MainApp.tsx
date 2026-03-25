import type { User } from "@supabase/supabase-js";
import { supabase } from "../actions/supabaseClient";
import { AccountsPanel } from "../../Accounts/components/AccountsPanel";
import { ClientsPanel } from "../../Clients/components/ClientsPanel";
import { UsersPanel } from "../../Auth/components/UsersPanel";
import { useMainApp } from "../hooks/useMainApp";

// ─── Main App ─────────────────────────────────────────────────────────────────
export function MainApp({ user }: { user: User }) {
  const {
    section,
    setSection,
    setActivePlatform,
    isAdmin,
    goBack,
    activePlatform,
    platforms,
    accountCounts,
    clientCounts,
    statuses,
  } = useMainApp({ user });
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <div className="app-logo">
            MAR<span>PEX</span>
          </div>
          <div className="app-user">{user.email}</div>
        </div>
        <button className="btn-logout" onClick={() => supabase.auth.signOut()}>
          Salir
        </button>
      </header>

      <nav className="app-nav">
        <button
          className={`nav-btn${section === "cuentas" ? " active" : ""}`}
          onClick={() => {
            setSection("cuentas");
            setActivePlatform(null);
          }}
        >
          Cuentas
        </button>
        <button
          className={`nav-btn${section === "clientes" ? " active" : ""}`}
          onClick={() => {
            setSection("clientes");
            setActivePlatform(null);
          }}
        >
          Clientes
        </button>
        {isAdmin && (
          <button
            className={`nav-btn${section === "usuarios" ? " active" : ""}`}
            onClick={() => {
              setSection("usuarios");
              setActivePlatform(null);
            }}
          >
            Usuarios
          </button>
        )}
      </nav>

      {section === "usuarios" ? (
        <UsersPanel onBack={goBack} />
      ) : !activePlatform ? (
        <div className="platform-grid">
          {platforms.map((p) => {
            const count =
              section === "cuentas"
                ? accountCounts[p.id] || 0
                : clientCounts[p.id] || 0;
            return (
              <button
                key={p.id}
                className="platform-btn"
                onClick={() => setActivePlatform(p)}
              >
                {count > 0 && <div className="badge">{count}</div>}
                <img
                  src={p.image}
                  alt={p.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>
      ) : section === "cuentas" ? (
        <AccountsPanel
          platform={activePlatform}
          statuses={statuses}
          onBack={goBack}
        />
      ) : (
        <ClientsPanel platform={activePlatform} onBack={goBack} />
      )}
    </div>
  );
}
