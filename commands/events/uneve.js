const Discord = require('discord.js')
const constants = require('../../constants.json')
const utl = require('../../utility')
const sMsg = 'Прочие роли'
module.exports =
    /**
     * @param {Array<string>} args Command argument
     * @param {Discord.Message} msg Discord message object
     * @param {Discord.Client} client Discord client object
     * @example Usage: .uneve
     */
    (args, msg, client) => {
        if(msg.member.roles.cache.find(r => r.id == constants.roles.eventee)) {
            msg.member.roles.remove(constants.roles.eventee)
            utl.embed(msg, sMsg, `У пользователя <@${msg.author.id}> была убрана роль <@&${constants.roles.eventee}>`)
        } else
            utl.embed(msg, sMsg, 'У Вас нет доступа к этой команде!')
    }
module.exports.allowedInGeneral = true