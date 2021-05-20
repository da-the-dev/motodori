const Discord = require('discord.js')
const constants = require('../../constants.json')
const utl = require('../../utility')
const { DBUser, getConnection } = utl.db
const sMsg = 'Прочие роли'
module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .toxic <member>
    */
    async (args, msg, client) => {
        if(utl.roles.privilage(msg.member, msg.guild.roles.cache.get(constants.roles.chatControl))) {
            var mMember = msg.mentions.members.first()
            if(!mMember) {
                utl.embed.ping(msg, sMsg, 'не указан участник!')
                return
            }

            const user = await new DBUser(msg.guild.id, mMember.id, getConnection())
            user.toxic = true
            await user.save()
            mMember.roles.add(constants.roles.toxic)

            utl.embed(msg, sMsg, `Пользователю <@${mMember.user.id}> была выдана роль <@&${constants.roles.toxic}>`)
            utl.moderatorLog.log(msg, 'toxic', msg.member, mMember, msg.createdTimestamp)
        } else
            utl.embed.ping(msg, sMsg, 'у Вас нет доступа к этой команде!')
    }
module.exports.allowedInGeneral = true