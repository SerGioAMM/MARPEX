import type { Profile } from "./tableProfile"

export interface Account {
  id: number
  platform_id: number
  email: string
  password: string
  profiles?: Profile[]
}