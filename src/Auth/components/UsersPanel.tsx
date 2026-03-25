import { useUsersPanel } from "../hooks/useUsersPanel";

type UsersPanelProps = {
  onBack: () => void;
};

export function UsersPanel({ onBack }: UsersPanelProps) {
  const {username, setUsername, loading, password, setPassword, handleSave,  error, message, users, handleDelete} = useUsersPanel();

  return (
    <div className="users-panel">
      <div className="panel-header">
        <button className="btn-nav" onClick={onBack}>
          ← Volver
        </button>
        <h2>Usuarios</h2>
      </div>

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
            <th>ID</th>
            <th>Correo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.email}</td>
              <td>
                <button
                  className="btn-danger"
                  onClick={() => handleDelete(user.id)}
                  disabled={loading}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={3}>
                No hay usuarios registrados en la tabla 'users'.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <p style={{ marginTop: "12px", color: "#a1a1aa" }}>
        Nota: para iniciar sesión se crea el usuario en Supabase Auth y también
        se almacena en tabla `users`.
      </p>
    </div>
  );
}
