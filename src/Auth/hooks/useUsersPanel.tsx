import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../Main/actions/supabaseClient";
import type { UserRecord } from "../interfaces/userRecord";

export const useUsersPanel = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadUsers = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from("users")
      .select("id, email, created_at")
      .order("created_at", { ascending: true });

    if (fetchError) {
      setError(
        "No se pudo cargar la lista de usuarios. Verifica la tabla 'users' y permisos.",
      );
      setUsers([]);
      return;
    }

    setUsers(data ?? []);
    setError("");
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const resetForm = () => {
    setUsername("");
    setPassword("");
  };

  const handleSave = async () => {
    if (!username || !password) {
      setError("Ingresa usuario y contraseña");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      // 1. Guardar la sesión del admin actual
      const {
        data: { session: adminSession },
      } = await supabase.auth.getSession();

      // 2. Crear el nuevo usuario (esto hace auto-login en Supabase)
      const { error: signupError } = await supabase.auth.signUp({
        email: `${username.trim().toLowerCase()}`,
        password,
      });

      if (signupError) throw signupError;

      // 3. Restaurar la sesión del admin inmediatamente
      if (adminSession) {
        await supabase.auth.setSession({
          access_token: adminSession.access_token,
          refresh_token: adminSession.refresh_token,
        });
      }

      setMessage("Usuario creado correctamente");
      resetForm();
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear usuario");
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar este usuario?")) return;

    setLoading(true);
    const { error: deleteError } = await supabase
      .from("users")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError("No se pudo eliminar el usuario");
    } else {
      setMessage("Usuario eliminado");
      await loadUsers();
    }
    setLoading(false);
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    loading,
    error,
    message,
    users,
    handleSave,
    handleDelete,
  };
};
