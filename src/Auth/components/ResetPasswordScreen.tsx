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

  useEffect(() => {
    // Verificar que estamos en el flujo correcto de reset
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");

    if (accessToken && refreshToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    }
  }, []);

  async function handleResetPassword() {
    if (!password) {
      setError("Ingresa una nueva contraseña");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    setError("");

    const { error: err } = await supabase.auth.updateUser({
      password: password,
    });

    if (err) {
      setError(`Error al actualizar contraseña: ${err.message}`);
    } else {
      setSuccess(true);
      setTimeout(() => {
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
              fontSize: "16px",
            }}
          >
            Contraseña actualizada exitosamente
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
          placeholder="Confirmar nueva contraseña"
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
