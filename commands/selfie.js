const Discord = require('discord.js')
const constants = require('../constants.json')
const utl = require('../utility')
const sMsg = 'Прочие роли'
module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .selfie <member>
    */
    (args, msg, client) => {
        var chatCRole = msg.guild.roles.cache.get(constants.roles.chatControl)
        if(msg.member.roles.cache.find(r => r.position >= chatCRole.position)) {
            var mMember = msg.mentions.members.first()
            if(!mMember) {
                utl.embed.ping(msg, sMsg, 'не указан участник!')
                return
            }

            mMember.roles.add(constants.roles.selfie)
            utl.embed(msg, sMsg, `Пользователю <@${mMember.user.id}> была выдана роль <@&${constants.roles.selfie}>`)
        } else
            utl.embed.ping(msg, sMsg, 'у Вас нет доступа к этой команде!')
    }
module.exports.allowedInGeneral = true