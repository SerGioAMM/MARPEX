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
  const [sessionError, setSessionError] = useState(false);

  useEffect(() => {
    const parseParams = () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const queryParams = new URLSearchParams(window.location.search);
      return {
        access_token:
          hashParams.get("access_token") || queryParams.get("access_token"),
        refresh_token:
          hashParams.get("refresh_token") || queryParams.get("refresh_token"),
        type: hashParams.get("type") || queryParams.get("type"),
        rawHash: window.location.hash,
        rawSearch: window.location.search,
      };
    };

    const {
      access_token: accessToken,
      refresh_token: refreshToken,
      type,
      rawHash,
      rawSearch,
    } = parseParams();

    console.log("ResetPasswordScreen params:", {
      accessToken,
      refreshToken,
      type,
      rawHash,
      rawSearch,
    });

    if (!accessToken) {
      setSessionError(true);
      setError(
        "No se encontró token de recuperación. Verifica que la URL tenga access_token.",
      );
      return;
    }

    if (!refreshToken) {
      setSessionError(true);
      setError("No se encontró refresh_token. El enlace es inválido.");
      return;
    }

    if (type && type !== "recovery") {
      setSessionError(true);
      setError("El link no es de tipo recovery válida. Pide un nuevo enlace.");
      return;
    }

    (async () => {
      const { data, error: sessionErrorResponse } =
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

      if (sessionErrorResponse) {
        console.error("Error setSession", sessionErrorResponse);
        setSessionError(true);
        setError(
          "No pudimos validar este enlace de recuperación (session error). Vuelve a intentarlo.",
        );
        return;
      }

      if (!data.session) {
        setSessionError(true);
        setError("No se pudo iniciar sesión con el token proporcionado.");
      }
    })();
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
        // Limpia la sesión de recovery y redirige al login
        supabase.auth.signOut();
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

  if (sessionError) {
    return (
      <div className="login-wrap">
        <div className="login-card">
          <h1>MARPEX</h1>
          <div className="login-sub">Restablecer Contraseña</div>
          <div className="err-msg">
            ❌ El enlace de recuperación ha expirado o es inválido. Solicita uno
            nuevo.
          </div>
          <button
            className="btn-main"
            onClick={() => (window.location.href = "/")}
            style={{ marginTop: "20px" }}
          >
            Volver al login
          </button>
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
