const Discord = require('discord.js')
const constants = require('../constants.json')
const { ban, pillar } = require('../constants.json').emojies
const utl = require('../utility')
const sMsg = 'Локальная блокировка'
module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .ban <member>
    */
    async (args, msg, client) => {
        var curatorRole = msg.guild.roles.cache.get(constants.roles.curator)
        if(msg.member.roles.cache.find(r => r.position >= curatorRole.position)) {
            var mMember = msg.mentions.members.first()
            if(!mMember) {
                utl.embed.ping(msg, sMsg, 'не указан участник!')
                return
            }

            var user = await new utl.db.DBUser(msg.guild.id, mMember.id)
            user.ban = true
            await user.save()

            mMember.roles.remove(mMember.roles.cache)
                .then(() => { mMember.roles.add(constants.roles.localban) })
            utl.embed(msg, sMsg, `${pillar}${ban}${pillar} Пользователю <@${mMember.id}> была выдана локальная блокировка`)
        } else
            utl.embed.ping(msg, sMsg, 'у Вас нет доступа к этой команде!')
    }
module.exports.allowedInGeneral = true