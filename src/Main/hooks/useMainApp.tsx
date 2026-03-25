import { useCallback, useEffect, useState } from "react";
import type { Section } from "../interfaces/menus";
import type { Platform } from "../interfaces/tablePlatform";
import type { Status } from "../interfaces/tableStatus";
import { supabase } from "../actions/supabaseClient";
import type { User } from "@supabase/supabase-js";

export const useMainApp = ({ user }: { user: User }) => {
  const [section, setSection] = useState<Section>("cuentas");
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [activePlatform, setActivePlatform] = useState<Platform | null>(null);

  // counts for badges
  const [accountCounts, setAccountCounts] = useState<Record<number, number>>(
    {},
  );
  const [clientCounts, setClientCounts] = useState<Record<number, number>>({});

  const loadPlatforms = useCallback(async () => {
    const { data } = await supabase.from("platforms").select("*").order("id");
    if (data) setPlatforms(data);
  }, []);

  const loadStatuses = useCallback(async () => {
    const { data } = await supabase.from("statuses").select("*");
    if (data) setStatuses(data);
  }, []);

  const loadCounts = useCallback(async () => {
    const { data: accs } = await supabase
      .from("accounts")
      .select("platform_id");
    const { data: clis } = await supabase.from("clients").select("platform_id");
    const ac: Record<number, number> = {};
    const cc: Record<number, number> = {};
    accs?.forEach((a) => {
      ac[a.platform_id] = (ac[a.platform_id] || 0) + 1;
    });
    clis?.forEach((c) => {
      cc[c.platform_id] = (cc[c.platform_id] || 0) + 1;
    });
    setAccountCounts(ac);
    setClientCounts(cc);
  }, []);

  useEffect(() => {
    loadPlatforms();
    loadStatuses();
    loadCounts();
  }, [loadPlatforms, loadStatuses, loadCounts]);

  const isAdmin =
    user.email === "omarlopez" || user.email === "sergio.zabbix01@gmail.com";

  function goBack() {
    setActivePlatform(null);
    setSection("cuentas");
    loadCounts();
  }
  return {
    section,
    setSection,
    setActivePlatform,
    isAdmin,
    goBack,
    activePlatform,
    platforms,
    accountCounts,
    clientCounts,
    statuses,
  };
};
