const Discord = require('discord.js')
const constants = require('../../constants.json')
const utl = require('../../utility')
const { DBUser } = utl.db
const sMsg = 'Снятие локальной блокировки'

module.exports =
    /**
     * @param {Array<string>} args Command argument
     * @param {Discord.Message} msg Discord message object
     * @param {Discord.Client} client Discord client object
     * @example Usage: .unban <member>
     */
    async (args, msg, client) => {
        if(utl.roles.privilage(msg.member, msg.guild.roles.cache.get(constants.roles.curator))) {
            const mMember = msg.mentions.members.first()
            if(!mMember) {
                utl.embed(msg, sMsg, 'Не указан участник!')
                return
            }

            const user = await new DBUser(msg.guild.id, mMember.id)
            user.ban = false
            await user.save()

            utl.embed(msg, sMsg, `C пользователя <@${mMember.id}> была снята локальная блокировка`)
            utl.actionLogs.modLog(client.guild, 'unban', msg.member, mMember, msg.createdTimestamp)
        } else
            utl.embed(msg, sMsg, 'У Вас нет доступа к этой команде!')
    }
module.exports.allowedInGeneral = true