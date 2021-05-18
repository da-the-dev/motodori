const Discord = require('discord.js')
const constants = require('../constants.json')
const utl = require('../utility')
const { DBUser, Connection, getConnection } = utl.db
const sMsg = 'Локальная блокировка'
module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .ban <member>
    */
    async (args, msg, client) => {
        if(utl.roles.privilage(msg.member, msg.guild.roles.cache.get(constants.roles.curator))) {
            var mMember = msg.mentions.members.first()
            if(!mMember) {
                utl.embed.ping(msg, sMsg, 'не указан участник!')
                return
            }


            var user = await new DBUser(msg.guild.id, mMember.id, getConnection())
            user.ban = true
            await user.save()


            utl.embed(msg, sMsg, `Пользователю <@${mMember.id}> была выдана локальная блокировка`)
        } else
            utl.embed.ping(msg, sMsg, 'у Вас нет доступа к этой команде!')
    }
module.exports.allowedInGeneral = true