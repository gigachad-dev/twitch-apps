import { Bot } from './bot.js'

export const bot = new Bot()
bot.connect().then(() => console.log('started!'))
