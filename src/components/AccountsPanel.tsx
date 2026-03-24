import { useCallback, useEffect, useState } from "react";
import type { Account } from "../interfaces/tableAccount";
import { supabase } from "../actions/supabaseClient";
import type { Profile } from "../interfaces/tableProfile";
import type { Platform } from "../interfaces/tablePlatform";
import type { Status } from "../interfaces/tableStatus";
import "../index.css";

// ─── Accounts Panel ──────────────────────────────────────────────────────────
export function AccountsPanel({ platform, statuses, onBack }: { platform: Platform; statuses: Status[]; onBack: () => void }) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [newEmail, setNewEmail] = useState('')
  const [newPass, setNewPass] = useState('')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Record<number, boolean>>({})
  const [loading, setLoading] = useState(true)

  const loadAccounts = useCallback(async () => {
    setLoading(true)
    const { data: accs } = await supabase
      .from('accounts')
      .select('*')
      .eq('platform_id', platform.id)
      .order('id')

    const { data: profs } = await supabase
      .from('profiles')
      .select('*')
      .in('account_id', (accs ?? []).map(a => a.id))

    const merged = (accs ?? []).map(a => ({
      ...a,
      profiles: (profs ?? []).filter(p => p.account_id === a.id)
    }))
    setAccounts(merged)
    setLoading(false)
  }, [platform.id])

  useEffect(() => { loadAccounts() }, [loadAccounts])

  async function addAccount() {
    if (!newEmail || !newPass) return alert('Completa correo y contraseña')
    const { error } = await supabase.from('accounts').insert({ platform_id: platform.id, email: newEmail, password: newPass })
    if (error) return alert('Error: ' + error.message)
    setNewEmail(''); setNewPass('')
    loadAccounts()
  }

  async function deleteAccount(id: number) {
    if (!confirm('¿Borrar esta cuenta y sus perfiles?')) return
    await supabase.from('profiles').delete().eq('account_id', id)
    await supabase.from('accounts').delete().eq('id', id)
    loadAccounts()
  }

  async function saveAccount(acc: Account) {
    await supabase.from('accounts').update({ email: acc.email, password: acc.password }).eq('id', acc.id)
    setEditing(e => ({ ...e, [acc.id]: false }))
  }

  async function addProfile(accountId: number) {
    const defaultStatus = statuses.find(s => s.name === 'disponible')?.id ?? statuses[0]?.id ?? 1
    await supabase.from('profiles').insert({ account_id: accountId, name: 'Perfil', status_id: defaultStatus, client_id: null })
    loadAccounts()
  }

  async function updateProfile(profile: Profile) {
    await supabase.from('profiles').update({ name: profile.name, status_id: profile.status_id, client_id: profile.client_id }).eq('id', profile.id)
  }

  async function deleteProfile(id: number) {
    await supabase.from('profiles').delete().eq('id', id)
    loadAccounts()
  }

  const filtered = accounts.filter(a => a.email.toLowerCase().includes(search.toLowerCase()))

  return (
    <>
      <button className="back-btn" onClick={onBack}>← Volver</button>
      <div className="section-title">{platform.name} — Cuentas</div>

      <div className="add-form">
        <input placeholder="Correo de la cuenta" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
        <input placeholder="Contraseña" value={newPass} onChange={e => setNewPass(e.target.value)} />
        <button className="btn-primary" onClick={addAccount}>Guardar Cuenta</button>
      </div>

      <input className="search-input" placeholder="🔍 Buscar cuenta..." value={search} onChange={e => setSearch(e.target.value)} />

      {loading && <div className="loading">Cargando cuentas...</div>}
      {!loading && filtered.length === 0 && <div className="empty-state">No hay cuentas registradas</div>}

      {filtered.map((acc, idx) => {
        const isEditing = editing[acc.id] ?? false
        return (
          <div key={acc.id} className="account-card">
            <div className="account-num">#{idx + 1}</div>
            <div className="account-top">
              <button className="btn-icon" onClick={() => {
                if (isEditing) saveAccount(acc)
                else setEditing(e => ({ ...e, [acc.id]: true }))
              }}>{isEditing ? '💾' : '✏️'}</button>
              <button className="btn-icon danger" onClick={() => deleteAccount(acc.id)}>✕</button>
            </div>
            <input
              className="account-field"
              disabled={!isEditing}
              value={acc.email}
              onChange={e => setAccounts(prev => prev.map(a => a.id === acc.id ? { ...a, email: e.target.value } : a))}
              placeholder="Correo"
            />
            <input
              className="account-field"
              disabled={!isEditing}
              value={acc.password}
              onChange={e => setAccounts(prev => prev.map(a => a.id === acc.id ? { ...a, password: e.target.value } : a))}
              placeholder="Contraseña"
            />
            <div className="profiles-section">
              {(acc.profiles ?? []).map(prof => (
                <div key={prof.id} className="profile-row">
                  <input className="profile-input" value={prof.name} placeholder="Nombre"
                    onChange={e => {
                      const updated = { ...prof, name: e.target.value }
                      setAccounts(prev => prev.map(a => a.id === acc.id ? { ...a, profiles: a.profiles?.map(p => p.id === prof.id ? updated : p) } : a))
                    }}
                    onBlur={() => updateProfile(prof)}
                  />
                  <input className="profile-input" value={prof.client_id?.toString() ?? ''} placeholder="ID Cliente"
                    onChange={e => {
                      const updated = { ...prof, client_id: e.target.value ? parseInt(e.target.value) : null }
                      setAccounts(prev => prev.map(a => a.id === acc.id ? { ...a, profiles: a.profiles?.map(p => p.id === prof.id ? updated : p) } : a))
                    }}
                    onBlur={() => updateProfile(prof)}
                  />
                  <select className="profile-select" value={prof.status_id}
                    onChange={async e => {
                      const updated = { ...prof, status_id: parseInt(e.target.value) }
                      setAccounts(prev => prev.map(a => a.id === acc.id ? { ...a, profiles: a.profiles?.map(p => p.id === prof.id ? updated : p) } : a))
                      await supabase.from('profiles').update({ status_id: updated.status_id }).eq('id', prof.id)
                    }}>
                    {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <button className="btn-del-sm" onClick={() => deleteProfile(prof.id)}>✕</button>
                </div>
              ))}
            </div>
            <button className="btn-add-profile" onClick={() => addProfile(acc.id)}>+ Agregar Perfil</button>
          </div>
        )
      })}
    </>
  )
}