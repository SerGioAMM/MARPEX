import { useCallback, useEffect, useState } from "react";
import type { ClientTab } from "../../Main/interfaces/menus";
import type { Client } from "../interfaces/tableClient";
import { supabase } from "../../Main/actions/supabaseClient";
import type { Platform } from "../../Main/interfaces/tablePlatform";
import { daysRemaining } from "../../Main/helpers/daysRemaining";

export const useClientsPanel = ({ platform }: { platform: Platform }) => {
  const [tab, setTab] = useState<ClientTab>(1);
  const [clients, setClients] = useState<Client[]>([]);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newDate, setNewDate] = useState("");
  const [searchActive, setSearchActive] = useState("");
  const [searchExpired, setSearchExpired] = useState("");
  const [loading, setLoading] = useState(true);

  const loadClients = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("clients")
      .select("*")
      .eq("platform_id", platform.id)
      .order("id");
    if (data) setClients(data);
    setLoading(false);
  }, [platform.id]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  async function addClient() {
    if (!newName || !newDate) return alert("Nombre y fecha son obligatorios");
    const { error } = await supabase.from("clients").insert({
      full_name: newName.trim(),
      phone_number: newPhone,
      platform_id: platform.id,
      start_date: newDate,
    });
    if (error) return alert("Error: " + error.message);
    setNewName("");
    setNewPhone("");
    setNewDate("");
    loadClients();
    alert("Cliente registrado");
  }

  async function deleteClient(id: number) {
    if (!confirm("¿Eliminar este cliente?")) return;
    await supabase.from("clients").delete().eq("id", id);
    loadClients();
  }

  async function renewClient(id: number, startDate: string) {
    await supabase
      .from("clients")
      .update({ start_date: startDate })
      .eq("id", id);
    loadClients();
  }

  const active = clients.filter((c) => daysRemaining(c.start_date) > 0);
  const expired = clients.filter((c) => daysRemaining(c.start_date) <= 0);

  const filteredActive = active.filter((c) =>
    c.full_name.toLowerCase().includes(searchActive.toLowerCase()),
  );
  const filteredExpired = expired.filter((c) =>
    c.full_name.toLowerCase().includes(searchExpired.toLowerCase()),
  );

  return {
    setTab,
    tab,
    active,
    expired,
    newName,
    setNewName,
    newPhone,
    setNewPhone,
    newDate,
    setNewDate,
    addClient,
    loading,
    searchActive,
    setSearchActive,
    searchExpired,
    setSearchExpired,
    filteredActive,
    filteredExpired,
    deleteClient,
    renewClient,
  };
};
