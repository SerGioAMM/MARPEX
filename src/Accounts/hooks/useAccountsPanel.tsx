import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../Main/actions/supabaseClient";
import type { Account } from "../../Accounts/interfaces/tableAccount";
import type { Platform } from "../../Main/interfaces/tablePlatform";
import type { Status } from "../../Main/interfaces/tableStatus";
import type { Profile } from "../interfaces/tableProfile";

export const useAccountsPanel = ({
  platform,
  statuses,
}: {
  platform: Platform;
  statuses: Status[];
}) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newPass, setNewPass] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    const { data: accs } = await supabase
      .from("accounts")
      .select("*")
      .eq("platform_id", platform.id)
      .order("id");

    const { data: profs } = await supabase
      .from("profiles")
      .select("*")
      .in(
        "account_id",
        (accs ?? []).map((a) => a.id),
      );

    const merged = (accs ?? []).map((a) => ({
      ...a,
      profiles: (profs ?? []).filter((p) => p.account_id === a.id),
    }));
    setAccounts(merged);
    setLoading(false);
  }, [platform.id]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  async function addAccount() {
    if (!newEmail || !newPass) return alert("Completa correo y contraseña");
    const { error } = await supabase
      .from("accounts")
      .insert({ platform_id: platform.id, email: newEmail, password: newPass });
    if (error) return alert("Error: " + error.message);
    setNewEmail("");
    setNewPass("");
    loadAccounts();
  }

  async function deleteAccount(id: number) {
    if (!confirm("¿Borrar esta cuenta y sus perfiles?")) return;
    await supabase.from("profiles").delete().eq("account_id", id);
    await supabase.from("accounts").delete().eq("id", id);
    loadAccounts();
  }

  async function saveAccount(acc: Account) {
    await supabase
      .from("accounts")
      .update({ email: acc.email, password: acc.password })
      .eq("id", acc.id);
    setEditing((e) => ({ ...e, [acc.id]: false }));
  }

  async function addProfile(accountId: number) {
    const defaultStatus =
      statuses.find((s) => s.name === "disponible")?.id ?? statuses[0]?.id ?? 1;
    await supabase.from("profiles").insert({
      account_id: accountId,
      name: "Perfil",
      status_id: defaultStatus,
      client_name: null,
    });
    loadAccounts();
  }

  async function updateProfile(profile: Profile) {
    await supabase
      .from("profiles")
      .update({
        name: profile.name,
        status_id: profile.status_id,
        client_name: profile.client_name,
      })
      .eq("id", profile.id);
  }

  async function deleteProfile(id: number) {
    await supabase.from("profiles").delete().eq("id", id);
    loadAccounts();
  }

  const filtered = accounts.filter((a) =>
    a.email.toLowerCase().includes(search.toLowerCase()),
  );

  return {
    setAccounts,
    newEmail,
    setNewEmail,
    newPass,
    setNewPass,
    search,
    setSearch,
    editing,
    setEditing,
    loading,
    addAccount,
    deleteAccount,
    saveAccount,
    addProfile,
    updateProfile,
    deleteProfile,
    filtered,
  };
};
