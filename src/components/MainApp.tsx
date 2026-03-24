import type { User } from "@supabase/supabase-js"
import { useCallback, useEffect, useState } from "react"
import type { Section } from "../interfaces/menus"
import type { Platform } from "../interfaces/tablePlatform"
import type { Status } from "../interfaces/tableStatus"
import { supabase } from "../actions/supabaseClient"
import { AccountsPanel } from "./AccountsPanel"
import { ClientsPanel } from "./ClientsPanel"

// ─── Main App ─────────────────────────────────────────────────────────────────
export function MainApp({ user }: { user: User }) {
  const [section, setSection] = useState<Section>('cuentas')
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [statuses, setStatuses] = useState<Status[]>([])
  const [activePlatform, setActivePlatform] = useState<Platform | null>(null)

  // counts for badges
  const [accountCounts, setAccountCounts] = useState<Record<number, number>>({})
  const [clientCounts, setClientCounts] = useState<Record<number, number>>({})

  const loadPlatforms = useCallback(async () => {
    const { data } = await supabase.from('platforms').select('*').order('id')
    if (data) setPlatforms(data)
  }, [])

  const loadStatuses = useCallback(async () => {
    const { data } = await supabase.from('statuses').select('*')
    if (data) setStatuses(data)
  }, [])

  const loadCounts = useCallback(async () => {
    const { data: accs } = await supabase.from('accounts').select('platform_id')
    const { data: clis } = await supabase.from('clients').select('platform_id')
    const ac: Record<number, number> = {}
    const cc: Record<number, number> = {}
    accs?.forEach(a => { ac[a.platform_id] = (ac[a.platform_id] || 0) + 1 })
    clis?.forEach(c => { cc[c.platform_id] = (cc[c.platform_id] || 0) + 1 })
    setAccountCounts(ac)
    setClientCounts(cc)
  }, [])

  useEffect(() => {
    loadPlatforms()
    loadStatuses()
    loadCounts()
  }, [loadPlatforms, loadStatuses, loadCounts])

  function goBack() {
    setActivePlatform(null)
    loadCounts()
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <div className="app-logo">MAR<span>PEX</span></div>
          <div className="app-user">{user.email}</div>
        </div>
        <button className="btn-logout" onClick={() => supabase.auth.signOut()}>Salir</button>
      </header>

      <nav className="app-nav">
        <button className={`nav-btn${section === 'cuentas' ? ' active' : ''}`} onClick={() => { setSection('cuentas'); setActivePlatform(null) }}>Cuentas</button>
        <button className={`nav-btn${section === 'clientes' ? ' active' : ''}`} onClick={() => { setSection('clientes'); setActivePlatform(null) }}>Clientes</button>
      </nav>

      {!activePlatform ? (
        <div className="platform-grid">
          {platforms.map(p => {
            const count = section === 'cuentas' ? (accountCounts[p.id] || 0) : (clientCounts[p.id] || 0)
            return (
              <button key={p.id} className="platform-btn" onClick={() => setActivePlatform(p)}>
                {count > 0 && <div className="badge">{count}</div>}
                <img src={p.image} alt={p.name} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                <span>{p.name}</span>
              </button>
            )
          })}
        </div>
      ) : section === 'cuentas' ? (
        <AccountsPanel platform={activePlatform} statuses={statuses} onBack={goBack} />
      ) : (
        <ClientsPanel platform={activePlatform} onBack={goBack} />
      )}
    </div>
  )
}
