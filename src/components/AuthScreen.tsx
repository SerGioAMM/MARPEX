import { useState } from "react";
import { supabase } from "../actions/supabaseClient";
import "../index.css";


export function AuthScreen() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) return setError("Completa todos los campos");
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (err) setError(err.message);
    setLoading(false);
  }

  async function handleRegister() {
    if (!email || !password) return setError("Completa todos los campos");
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signUp({ email, password });
    if (err) setError(err.message);
    else {
      setError("");
      alert("¡Cuenta creada! Revisa tu correo para confirmar.");
    }
    setLoading(false);
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">MARPEX</div>
        <div className="login-sub">Panel de Control</div>
        <div className="login-tabs">
          <button
            className={`login-tab${tab === "login" ? " active" : ""}`}
            onClick={() => {
              setTab("login");
              setError("");
            }}
          >
            Ingresar
          </button>
          <button
            className={`login-tab${tab === "register" ? " active" : ""}`}
            onClick={() => {
              setTab("register");
              setError("");
            }}
          >
            Registro
          </button>
        </div>
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
          onKeyDown={(e) =>
            e.key === "Enter" &&
            (tab === "login" ? handleLogin() : handleRegister())
          }
        />
        <button
          className="btn-primary"
          onClick={tab === "login" ? handleLogin : handleRegister}
          disabled={loading}
        >
          {loading
            ? "Procesando..."
            : tab === "login"
              ? "ENTRAR"
              : "CREAR CUENTA"}
        </button>
      </div>
    </div>
  );
}
