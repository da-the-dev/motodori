const Discord = require('discord.js')
const utl = require('../../utility')
const constants = require('../../constants.json')
const sMsg = 'Удаление сообщений'
module.exports =
    /**
     * @param {Array<string>} args Command argument
     * @param {Discord.Message} msg Discord message object
     * @param {Discord.Client} client Discord client object
     * @example Usage: .clear <amount>
     */
    async (args, msg, client) => {
        if(utl.roles.privilage(msg.member, msg.guild.roles.cache.get(constants.roles.chatControl))) {
            const msgAmount = Number(args[1])
            if(!msgAmount) {
                utl.embed(msg, sMsg, 'Не указано количество сообщений!')
                return
            }
            if(!Number.isInteger(msgAmount) && !Number.isFinite(msgAmount) && !Number.isNaN(msgAmount)) {
                utl.embed(msg, sMsg, 'Указано неверное количество сообщений!')
                return
            }

            const hundreds = Math.floor(msgAmount / 100)
            const rest = msgAmount % 100

            for(let i = 0; i < hundreds; i++)
                msg.channel.bulkDelete(100)

            rest > 0 ? await msg.channel.bulkDelete(rest) : null
            utl.embed(msg, sMsg, `Удалено сообщений **(${msgAmount})**`).then(m => m.delete({ timeout: 3000 }))
        } else
            utl.embed(msg, sMsg, 'У Вас нет прав на эту команду!')
    }
module.exports.allowedInGeneral = true