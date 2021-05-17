const Discord = require('discord.js')
const constants = require('../constants.json')
const { DBUser, Connection } = utl.db
const utl = require('../utility')
const sMsg = 'Снятие локальной блокировки'

module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .unban <member>
    */
    (args, msg, client) => {
        if(utl.roles.privilage(msg.member, msg.guild.roles.cache.get(constants.roles.curator))) {
            var mMember = msg.mentions.members.first()
            if(!mMember) {
                utl.embed(msg, sMsg, 'Не указан участник!')
                return
            }

            const con = await new Connection()
            const user = await new DBUser(msg.guild.id, mMember.id, con)

            user.ban = false
            await user.save()

            con.close()

            utl.embed(msg, sMsg, `C пользователя <@${mMember.id}> была снята локальная блокировка`)
        } else
            utl.embed(msg, sMsg, 'У Вас нет доступа к этой команде!')
    }
module.exports.allowedInGeneral = true