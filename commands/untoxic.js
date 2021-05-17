const Discord = require('discord.js')
const constants = require('../constants.json')
const utl = require('../utility')
const { DBUser, Connection } = utl.db
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

            const con = await new Connection()
            const user = await new DBUser(msg.guild.id, mMember.id, con)

            user.toxic = false

            await user.save()
            con.close()

            utl.embed(msg, sMsg, `У пользователя <@${mMember.user.id}> была убрана роль <@&${constants.roles.toxic}>`)
        } else
            utl.embed.ping(msg, sMsg, 'у Вас нет доступа к этой команде!')
    }
module.exports.allowedInGeneral = true