import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Prisma } from '@twitch-apps/prisma'

export const scopes = [
  'analytics:read:extensions',
  'user:edit',
  'user:read:email',
  'clips:edit',
  'bits:read',
  'analytics:read:games',
  'user:edit:broadcast',
  'user:read:broadcast',
  'chat:read',
  'chat:edit',
  'channel:moderate',
  'channel:read:subscriptions',
  'whispers:read',
  'whispers:edit',
  'moderation:read',
  'channel:read:redemptions',
  'channel:edit:commercial',
  'channel:read:hype_train',
  'channel:read:stream_key',
  'channel:manage:extensions',
  'channel:manage:broadcast',
  'user:edit:follows',
  'channel:manage:redemptions',
  'channel:read:editors',
  'channel:manage:videos',
  'user:read:blocked_users',
  'user:manage:blocked_users',
  'user:read:subscriptions',
  'user:read:follows',
  'channel:manage:polls',
  'channel:manage:predictions',
  'channel:read:polls',
  'channel:read:predictions',
  'moderator:manage:automod',
  'channel:manage:schedule',
  'channel:read:goals',
  'moderator:read:automod_settings',
  'moderator:manage:automod_settings',
  'moderator:manage:banned_users',
  'moderator:read:blocked_terms',
  'moderator:manage:blocked_terms',
  'moderator:read:chat_settings',
  'moderator:manage:chat_settings',
  'channel:manage:raids',
  'moderator:manage:announcements',
  'moderator:manage:chat_messages',
  'user:manage:chat_color',
  'channel:manage:moderators',
  'channel:read:vips',
  'channel:manage:vips',
  'user:manage:whispers'
]

export const commandsPath = (command: string = ''): string => {
  return resolve(dirname(fileURLToPath(import.meta.url)), 'commands', command)
}

export const builtInCommands: Prisma.CommandCreateManyChannelInput[] = [
  {
    name: 'balaboba',
    userlevel: ['everyone']
  },
  {
    name: 'cat',
    userlevel: ['everyone'],
    description: 'Случайная картинка котейки',
    aliases: ['кот']
  },
  {
    name: 'irc',
    userlevel: ['everyone']
  },
  {
    name: 'tts',
    description: 'Text to Speech',
    userlevel: [
      'vip',
      'subscriber',
      'moderator',
      'broadcaster',
      'regular'
    ],
    aliases: ['ттс']
  }
]
