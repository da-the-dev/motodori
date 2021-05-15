const Discord = require('discord.js')
const utl = require('../utility')
const constants = require('../constants.json')
const sMsg = 'Удаление сообщений'
module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Handles reaction commands
    */
    async (args, msg, client) => {
        var chatCRole = msg.guild.roles.cache.get(constants.roles.chatControl)
        if(msg.member.roles.cache.find(r => r.position >= chatCRole.position)) {
            var msgAmount = Number(args[1])
            if(!msgAmount) {
                utl.embed(msg, sMsg, 'Не указано количество сообщений!')
                return
            }
            if(!Number.isInteger(msgAmount) && !Number.isFinite(msgAmount) && !Number.isNaN(msgAmount)) {
                utl.embed(msg, sMsg, 'Указано неверное количество сообщений!')
                return
            }

            var hundreds = Math.floor(msgAmount / 100)
            var rest = msgAmount % 100

            for(i = 0; i < hundreds; i++)
                msg.channel.bulkDelete(100)

            rest > 0 ? await msg.channel.bulkDelete(rest) : null
            utl.embed(msg, sMsg, `Удалено сообщений **(${msgAmount})**`).then(m => m.delete({ timeout: 3000 }))
        } else
            utl.embed(msg, sMsg, 'У Вас нет прав на эту команду!')
    }
module.exports.allowedInGeneral = true