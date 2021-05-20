const Discord = require('discord.js')
const constants = require(require('path').resolve('constants.json'))
const utl = require(require('path').resolve('utility.js'))
const { DBUser, Connection, getConnection } = utl.db
const sMsg = 'Прочие роли'
module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .toxic <member>
    */
    async (args, msg, client) => {
        var chatCRole = msg.guild.roles.cache.get(constants.roles.chatControl)
        if(msg.member.roles.cache.find(r => r.position >= chatCRole.position)) {
            var mMember = msg.mentions.members.first()
            if(!mMember) {
                utl.embed.ping(msg, sMsg, 'не указан участник!')
                return
            }

            const user = await new DBUser(msg.guild.id, mMember.id, getConnection())
            user.toxic = false
            await user.save()
            mMember.roles.remove(constants.roles.toxic)

            utl.embed(msg, sMsg, `У пользователя <@${mMember.user.id}> была убрана роль <@&${constants.roles.toxic}>`)
            utl.moderatorLog.log(msg, 'untoxic', msg.member, mMember, msg.createdTimestamp)
        } else
            utl.embed.ping(msg, sMsg, 'у Вас нет доступа к этой команде!')
    }
module.exports.allowedInGeneral = true