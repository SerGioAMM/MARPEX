import type { Profile } from "../interfaces/tableProfile";

export interface Account {
  id: number
  platform_id: number
  email: string
  password: string
  profiles?: Profile[]
}