const Discord = require('discord.js')
const constants = require('../constants.json')
const { pillar, ban } = require('../constants.json').emojies
const utl = require('../utility')
const sMsg = 'Снятие локальной блокировки'

module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .unban <member>
    */
    async (args, msg, client) => {
        var curatorRole = msg.guild.roles.cache.get(constants.roles.curator)
        if(msg.member.roles.cache.find(r => r.position >= curatorRole.position)) {
            var mMember = msg.mentions.members.first()
            if(!mMember) {
                utl.embed(msg, sMsg, 'Не указан участник!')
                return
            }


            var user = await new utl.db.DBUser(msg.guild.id, mMember.id)
            user.ban = false
            user.save()

            mMember.roles.remove(constants.roles.localban)
                .then(() => utl.embed(msg, sMsg, `${pillar}${ban}${pillar} C пользователя <@${mMember.id}> была снята локальная блокировка`))

        } else
            utl.embed(msg, sMsg, 'У Вас нет доступа к этой команде!')
    }
module.exports.allowedInGeneral = true