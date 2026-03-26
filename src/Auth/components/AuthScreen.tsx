import { useAuthScreen } from "../hooks/useAuthScreen";
import "../../style.css";

export function AuthScreen() {
  const {
    error,
    email,
    setEmail,
    password,
    setPassword,
    handleLogin,
    loading,
    handleRecover,
    recovering,
  } = useAuthScreen();
  return (
    <div className="login-wrap">
      <div className="login-card">
        <h1>MARPEX</h1>
        <div className="login-sub">Panel de Control</div>
        
        {error && <div className="err-msg">{error}</div>}
        <input
          className="field"
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="field"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />
        <button className="btn-main" onClick={handleLogin} disabled={loading}>
          {loading ? "Procesando..." : "ENTRAR"}
        </button>

        {
          <button
            onClick={handleRecover}
            disabled={recovering}
            style={{
              marginTop: "12px",
              background: "none",
              border: "none",
              color: "var(--muted)",
              fontFamily: "var(--font)",
              fontSize: "12px",
              cursor: "pointer",
              textDecoration: "underline",
              width: "100%",
            }}
          >
            {recovering ? "Enviando..." : "¿Olvidaste tu contraseña?"}
          </button>
        }
      </div>
    </div>
  );
}
