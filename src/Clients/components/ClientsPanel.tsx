import type { Platform } from "../../Main/interfaces/tablePlatform";
import { daysRemaining } from "../../Main/helpers/daysRemaining";
import { useClientsPanel } from "../hooks/useClientsPanel";
import "../../index.css";

export function ClientsPanel({
  platform,
  onBack,
}: {
  platform: Platform;
  onBack: () => void;
}) {
  const {
    setTab,
    tab,
    active,
    expired,
    newName,
    setNewName,
    newPhone,
    setNewPhone,
    newDate,
    setNewDate,
    addClient,
    loading,
    searchActive,
    setSearchActive,
    searchExpired,
    setSearchExpired,
    filteredActive,
    filteredExpired,
    deleteClient,
    renewClient,
  } = useClientsPanel({ platform });
  return (
    <>
      <button className="back-btn" onClick={onBack}>
        ← Volver
      </button>
      <div className="section-title">{platform.name} — Clientes</div>

      <div className="client-tabs">
        <button
          className={`tab-btn${tab === 1 ? " active" : ""}`}
          onClick={() => setTab(1)}
        >
          1. Agregar
        </button>
        <button
          className={`tab-btn${tab === 2 ? " active" : ""}`}
          onClick={() => setTab(2)}
        >
          2. Activos ({active.length})
        </button>
        <button
          className={`tab-btn${tab === 3 ? " active" : ""}`}
          onClick={() => setTab(3)}
        >
          3. Vencidos ({expired.length})
        </button>
      </div>

      {tab === 1 && (
        <div className="add-form">
          <input
            placeholder="Nombre completo"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input
            placeholder="WhatsApp (Ej: 504...)"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
          />
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            style={{ colorScheme: "dark" }}
          />
          <button className="btn-primary" onClick={addClient}>
            Registrar Cliente
          </button>
        </div>
      )}

      {tab === 2 && (
        <>
          {loading && <div className="loading">Cargando...</div>}
          <input
            className="search-input"
            placeholder="🔍 Buscar activo..."
            value={searchActive}
            onChange={(e) => setSearchActive(e.target.value)}
          />
          {filteredActive.length === 0 && !loading && (
            <div className="empty-state">Sin clientes activos</div>
          )}
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Días restantes</th>
                <th>Borrar</th>
              </tr>
            </thead>
            <tbody>
              {filteredActive.map((c, i) => (
                <tr key={c.id}>
                  <td
                    style={{
                      color: "var(--muted)",
                      fontFamily: "var(--mono)",
                      fontSize: 11,
                    }}
                  >
                    {i + 1}
                  </td>
                  <td>{c.full_name}</td>
                  <td>
                    <span className="pill-success">
                      {daysRemaining(c.start_date)}d
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-del-row"
                      onClick={() => deleteClient(c.id)}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {tab === 3 && (
        <>
          {loading && <div className="loading">Cargando...</div>}
          <input
            className="search-input"
            placeholder="🔍 Buscar vencido..."
            value={searchExpired}
            onChange={(e) => setSearchExpired(e.target.value)}
          />
          {filteredExpired.length === 0 && !loading && (
            <div className="empty-state">Sin clientes vencidos</div>
          )}
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Mora</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpired.map((c, i) => {
                const msg = `Hola ${c.full_name}, te recordamos que tu servicio de ${platform.name} ha vencido. Por favor renueva para continuar disfrutando del servicio.`;
                return (
                  <tr key={c.id}>
                    <td
                      style={{
                        color: "var(--muted)",
                        fontFamily: "var(--mono)",
                        fontSize: 11,
                      }}
                    >
                      {i + 1}
                    </td>
                    <td>{c.full_name}</td>
                    <td>
                      <span className="pill-danger">
                        {Math.abs(daysRemaining(c.start_date))}d
                      </span>
                    </td>
                    <td>
                      <div className="action-row">
                        {c.phone_number && (
                          <a
                            className="btn-ws"
                            href={`https://wa.me/${c.phone_number}?text=${encodeURIComponent(msg)}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            WS
                          </a>
                        )}
                        <button
                          className="btn-renew"
                          onClick={() => renewClient(c.id)}
                        >
                          Renovar
                        </button>
                        <button
                          className="btn-del-row"
                          onClick={() => deleteClient(c.id)}
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </>
  );
}
