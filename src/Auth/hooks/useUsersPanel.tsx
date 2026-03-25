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
      const { data: authData, error: signupError } = await supabase.auth.signUp({
        email: `${username.trim().toLowerCase()}`,
        password,
      });

      if (signupError) throw signupError;

      if (authData.user) {
        const { error: insertError } = await supabase
          .from("user_profiles")
          .insert({
            id: authData.user.id,
            username: username.trim().toLowerCase(),
          });

        if (insertError) throw insertError;
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
      .from("user_profiles")
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