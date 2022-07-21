import 'dotenv/config'
import { cleanEnv, str } from 'envalid'

export const config = cleanEnv(process.env, {
  CLIENT_ID: str(),
  CLIENT_SECRET: str(),
  ACCESS_TOKEN: str(),
  REFRESH_TOKEN: str()
})
