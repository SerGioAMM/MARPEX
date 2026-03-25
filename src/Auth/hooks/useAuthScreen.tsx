import { useState } from "react";
import { supabase } from "../../Main/actions/supabaseClient";

export const useAuthScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recovering, setRecovering] = useState(false);

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

  async function handleRecover() {
    if (!email) {
      setError("Ingresa tu usuario para recuperar la contraseña");
      return;
    }
    setRecovering(true);
    setError("");

    const { error: err } = await supabase.auth.resetPasswordForEmail(
      `${email.trim().toLowerCase()}`,
      {
        // URL a la que Supabase redirigirá después de que el usuario
        // haga clic en el link del correo. Debes configurar esta URL
        // en Supabase → Authentication → URL Configuration → Redirect URLs
        redirectTo: `${window.location.origin}/reset-password`,
      },
    );

    if (err) setError(err.message);
    else postMessage("Correo de recuperación enviado. Revisa tu bandeja.");

    setRecovering(false);
  }

  return {
    error,
    email,
    setEmail,
    password,
    setPassword,
    handleLogin,
    loading,
    handleRecover,
    recovering,
  };
};
