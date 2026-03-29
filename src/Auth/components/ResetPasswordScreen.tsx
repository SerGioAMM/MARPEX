import { useState, useEffect } from "react";
import { supabase } from "../../Main/actions/supabaseClient";
import "../../index.css";
import "../../style.css";

export function ResetPasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // 1. Revisar si ya hay una sesión activa (caso: Supabase procesó el code antes del mount)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      }
    });

    // 2. Escuchar por si llega después
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") && session) {
        setSessionReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleResetPassword() {
    if (!password) return setError("Ingresa una nueva contraseña");
    if (password.length < 6) return setError("Mínimo 6 caracteres");
    if (password !== confirmPassword)
      return setError("Las contraseñas no coinciden");

    setLoading(true);
    setError("");

    const { error: err } = await supabase.auth.updateUser({ password });

    if (err) {
      setError(`Error: ${err.message}`);
    } else {
      setSuccess(true);
      setTimeout(async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
      }, 2000);
    }

    setLoading(false);
  }

  if (success) {
    return (
      <div className="login-wrap">
        <div className="login-card">
          <h1>MARPEX</h1>
          <div className="login-sub">Panel de Control</div>
          <div
            style={{
              color: "var(--success)",
              textAlign: "center",
              margin: "20px 0",
            }}
          >
            ✅ Contraseña actualizada exitosamente
          </div>
          <div
            style={{
              textAlign: "center",
              color: "var(--text)",
              fontSize: "14px",
            }}
          >
            Redirigiendo al login...
          </div>
        </div>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div className="login-wrap">
        <div className="login-card">
          <h1>MARPEX</h1>
          <div className="login-sub">Restablecer Contraseña</div>
          <div
            style={{
              textAlign: "center",
              color: "var(--muted)",
              margin: "20px 0",
            }}
          >
            Verificando enlace...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <h1>MARPEX</h1>
        <div className="login-sub">Restablecer Contraseña</div>

        {error && <div className="err-msg">{error}</div>}

        <input
          className="field"
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          className="field"
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
        />

        <button
          className="btn-main"
          onClick={handleResetPassword}
          disabled={loading}
        >
          {loading ? "Actualizando..." : "ACTUALIZAR CONTRASEÑA"}
        </button>

        <button
          onClick={() => (window.location.href = "/")}
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
          ← Volver al login
        </button>
      </div>
    </div>
  );
}
