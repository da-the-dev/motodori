const Discord = require('discord.js')
const constants = require('../../constants.json')
const utl = require('../../utility')
const { DBUser } = utl.db
const sMsg = 'Прочие роли'
module.exports =
    /**
     * @param {Array<string>} args Command argument
     * @param {Discord.Message} msg Discord message object
     * @param {Discord.Client} client Discord client object
     * @example Usage: .toxic <member>
     */
    async (args, msg, client) => {
        const chatCRole = msg.guild.roles.cache.get(constants.roles.chatControl)
        if(msg.member.roles.cache.find(r => r.position >= chatCRole.position)) {
            const mMember = msg.mentions.members.first()
            if(!mMember) {
                utl.embed.ping(msg, sMsg, 'не указан участник!')
                return
            }

            const user = await new DBUser(msg.guild.id, mMember.id)
            user.toxic = false
            await user.save()
            mMember.roles.remove(constants.roles.toxic)

            utl.embed(msg, sMsg, `У пользователя <@${mMember.user.id}> была убрана роль <@&${constants.roles.toxic}>`)
            utl.actionLogs.modLog(client.guild, 'untoxic', msg.member, mMember, msg.createdTimestamp)
        } else
            utl.embed.ping(msg, sMsg, 'у Вас нет доступа к этой команде!')
    }
module.exports.allowedInGeneral = true