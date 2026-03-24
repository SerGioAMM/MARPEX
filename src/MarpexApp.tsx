import { useEffect, useState } from "react"
import { type User } from "@supabase/supabase-js";
import { supabase } from "./actions/supabaseClient";
import { MainApp } from "./components/MainApp";
import { AuthScreen } from "./components/AuthScreen";

export default function MarpexApp() {
  // inject CSS once
  useEffect(() => {
    if (!document.getElementById('marpex-styles')) {
      const tag = document.createElement('style')
      tag.id = 'marpex-styles'
    //   tag.textContent = CSS
      document.head.appendChild(tag)
    }
  }, [])

  const [user, setUser] = useState<User | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setAuthChecked(true)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  if (!authChecked) return <div className="loading">Cargando...</div>

  return (
    <div className="marpex-root">
      {user ? <MainApp user={user} /> : <AuthScreen />}
    </div>
  )
}