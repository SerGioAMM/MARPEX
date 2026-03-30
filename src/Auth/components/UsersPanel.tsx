import { useUsersPanel } from "../hooks/useUsersPanel";

type UsersPanelProps = {
  onBack: () => void;
};

export function UsersPanel({ onBack }: UsersPanelProps) {
  const {
    username,
    setUsername,
    loading,
    password,
    setPassword,
    handleSave,
    error,
    message,
    users,
    handleDelete,
  } = useUsersPanel();

  return (
    <>
      <div className="panel-header">
        <button className="back-btn" onClick={onBack}>
          ← Volver
        </button>
        <div className="section-title">Usuarios</div>
      </div>
      <div className="users-panel">
        <div className="form-row">
          <input
            type="email"
            placeholder="Correo del usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <button className="btn-main" onClick={handleSave} disabled={loading}>
            {loading ? "Guardando..." : "Crear"}
          </button>
        </div>

        {error && <div className="err-msg">{error}</div>}
        {message && <div className="success-msg">{message}</div>}

        <table>
          <thead>
            <tr>
              <th>Correo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="username">{user.email}</td>
                <td>
                  {user.email !== "marpexapp@gmail.com" && (
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(user.id)}
                      disabled={loading}
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={3}>
                  No hay usuarios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
