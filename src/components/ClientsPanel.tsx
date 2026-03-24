import { useCallback, useEffect, useState } from "react";
import type { Platform } from "../interfaces/tablePlatform";
import type { ClientTab } from "../interfaces/menus";
import type { Client } from "../interfaces/tableClient";
import { supabase } from "../actions/supabaseClient";
import { daysRemaining } from "../helpers/daysRemaining";
import "../index.css";

// ─── Clients Panel ────────────────────────────────────────────────────────────
export function ClientsPanel({ platform, onBack }: { platform: Platform; onBack: () => void }) {
  const [tab, setTab] = useState<ClientTab>(1)
  const [clients, setClients] = useState<Client[]>([])
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newDate, setNewDate] = useState('')
  const [searchActive, setSearchActive] = useState('')
  const [searchExpired, setSearchExpired] = useState('')
  const [loading, setLoading] = useState(true)

  const loadClients = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('platform_id', platform.id)
      .order('id')
    if (data) setClients(data)
    setLoading(false)
  }, [platform.id])

  useEffect(() => { loadClients() }, [loadClients])

  async function addClient() {
    if (!newName || !newDate) return alert('Nombre y fecha son obligatorios')
    const { error } = await supabase.from('clients').insert({
      full_name: newName, phone_number: newPhone, platform_id: platform.id, start_date: newDate
    })
    if (error) return alert('Error: ' + error.message)
    setNewName(''); setNewPhone(''); setNewDate('')
    loadClients()
    alert('Cliente registrado')
  }

  async function deleteClient(id: number) {
    if (!confirm('¿Eliminar este cliente?')) return
    await supabase.from('clients').delete().eq('id', id)
    loadClients()
  }

  async function renewClient(id: number) {
    const today = new Date().toISOString().split('T')[0]
    await supabase.from('clients').update({ start_date: today }).eq('id', id)
    loadClients()
  }

  const active = clients.filter(c => daysRemaining(c.start_date) > 0)
  const expired = clients.filter(c => daysRemaining(c.start_date) <= 0)

  const filteredActive = active.filter(c => c.full_name.toLowerCase().includes(searchActive.toLowerCase()))
  const filteredExpired = expired.filter(c => c.full_name.toLowerCase().includes(searchExpired.toLowerCase()))

  return (
    <>
      <button className="back-btn" onClick={onBack}>← Volver</button>
      <div className="section-title">{platform.name} — Clientes</div>

      <div className="client-tabs">
        <button className={`tab-btn${tab === 1 ? ' active' : ''}`} onClick={() => setTab(1)}>1. Agregar</button>
        <button className={`tab-btn${tab === 2 ? ' active' : ''}`} onClick={() => setTab(2)}>2. Activos ({active.length})</button>
        <button className={`tab-btn${tab === 3 ? ' active' : ''}`} onClick={() => setTab(3)}>3. Vencidos ({expired.length})</button>
      </div>

      {tab === 1 && (
        <div className="add-form">
          <input placeholder="Nombre completo" value={newName} onChange={e => setNewName(e.target.value)} />
          <input placeholder="WhatsApp (Ej: 504...)" value={newPhone} onChange={e => setNewPhone(e.target.value)} />
          <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} style={{ colorScheme: 'dark' }} />
          <button className="btn-primary" onClick={addClient}>Registrar Cliente</button>
        </div>
      )}

      {tab === 2 && (
        <>
          {loading && <div className="loading">Cargando...</div>}
          <input className="search-input" placeholder="🔍 Buscar activo..." value={searchActive} onChange={e => setSearchActive(e.target.value)} />
          {filteredActive.length === 0 && !loading && <div className="empty-state">Sin clientes activos</div>}
          <table>
            <thead><tr><th>#</th><th>Nombre</th><th>Días restantes</th><th>Borrar</th></tr></thead>
            <tbody>
              {filteredActive.map((c, i) => (
                <tr key={c.id}>
                  <td style={{ color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 11 }}>{i + 1}</td>
                  <td>{c.full_name}</td>
                  <td><span className="pill-success">{daysRemaining(c.start_date)}d</span></td>
                  <td><button className="btn-del-row" onClick={() => deleteClient(c.id)}>✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {tab === 3 && (
        <>
          {loading && <div className="loading">Cargando...</div>}
          <input className="search-input" placeholder="🔍 Buscar vencido..." value={searchExpired} onChange={e => setSearchExpired(e.target.value)} />
          {filteredExpired.length === 0 && !loading && <div className="empty-state">Sin clientes vencidos</div>}
          <table>
            <thead><tr><th>#</th><th>Nombre</th><th>Mora</th><th>Acciones</th></tr></thead>
            <tbody>
              {filteredExpired.map((c, i) => {
                const msg = `Hola ${c.full_name}, te recordamos que tu servicio de ${platform.name} ha vencido. Por favor renueva para continuar disfrutando del servicio.`
                return (
                  <tr key={c.id}>
                    <td style={{ color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 11 }}>{i + 1}</td>
                    <td>{c.full_name}</td>
                    <td><span className="pill-danger">{Math.abs(daysRemaining(c.start_date))}d</span></td>
                    <td>
                      <div className="action-row">
                        {c.phone_number && (
                          <a className="btn-ws" href={`https://wa.me/${c.phone_number}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noreferrer">WS</a>
                        )}
                        <button className="btn-renew" onClick={() => renewClient(c.id)}>Renovar</button>
                        <button className="btn-del-row" onClick={() => deleteClient(c.id)}>✕</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </>
      )}
    </>
  )
}