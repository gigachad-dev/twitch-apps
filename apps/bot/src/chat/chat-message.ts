import type { ChatUserstate, CommonUserstate } from '@twurple/auth-tmi'
import type { Client } from '../client.js'
import { ChatChannel } from './chat-channel.js'
import { ChatUser } from './chat-user.js'
import type { ChatterState } from './types.js'

export class ChatMessage {
  private chatChannel: ChatChannel
  private chatUser: ChatUser

  constructor(
    private readonly client: Client,
    private readonly originalMessage: ChatterState,
    channel: string
  ) {
    this.chatChannel = new ChatChannel({
      channel,
      room_id: originalMessage['room-id']!
    })

    this.chatUser = new ChatUser(originalMessage, client)
  }

  /**
   * Text of the message
   */
  get text(): string {
    return this.originalMessage.message
  }

  /**
   * The author of the message
   */
  get author(): ChatUser {
    return this.chatUser
  }

  /**
   * The ID of the message
   */
  get id(): string {
    return this.originalMessage.id!
  }

  /**
   * The channel where the message has been sent in
   */
  get channel(): ChatChannel {
    return this.chatChannel
  }

  /**
   * Text color
   */
  get color(): string {
    return this.originalMessage.color!
  }

  /**
   * Emotes contained in the message
   */
  get emotes(): CommonUserstate['emotes'] {
    return this.originalMessage.emotes
  }

  /**
   * Message type
   */
  get messageType(): ChatUserstate['message-type'] {
    return this.originalMessage['message-type']
  }

  /**
   * Helper method to reply quickly to a message. Create a message to send in the channel with @author <text>
   *
   * @param text
   */
  async reply(text: string): Promise<[string, string] | [string]> {
    if (this.messageType === 'whisper') {
      return this.client.irc.whisper(this.author.username, text)
    } else {
      return this.client.irc.say(
        this.channel.name,
        `@${this.author.displayName}, ${text}`
      )
    }
  }

  /**
   * Helper method to reply quickly to a message with an action
   *
   * @param text
   */
  async actionReply(text: string): Promise<[string]> {
    return this.client.irc.action(
      this.channel.name,
      `@${this.author.displayName}, ${text}`
    )
  }

  /**
   * Helper method to send message
   *
   * @param text
   */
  async say(text: string): Promise<[string]> {
    return this.client.irc.say(this.channel.name, text)
  }

  /**
   * Helper method to a message with an action
   *
   * @param text
   */
  async actionSay(text: string): Promise<[string]> {
    return this.client.irc.action(this.channel.name, text)
  }
}
