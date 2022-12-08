import type { ChatUserstate } from '@twurple/auth-tmi/lib/index.js'

export type ChatterState = Required<ChatUserstate> & { message: string }
