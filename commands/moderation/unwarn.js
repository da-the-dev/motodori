const Discord = require('discord.js')
const utl = require('../../utility')
const { DBUser } = utl.db
const constants = require('../../constants.json')
const sMsg = 'Снятие предупреждений'
module.exports =
    /**
     * @param {Array<string>} args Command argument
     * @param {Discord.Message} msg Discord message object
     * @param {Discord.Client} client Discord client object
     * @description Usage: .unwarn <member> <index>
     */
    async (args, msg, client) => {
        if(utl.roles.privilage(msg.member, msg.guild.roles.cache.get(constants.roles.chatControl))) {
            const mMember = msg.mentions.members.first()

            if(!mMember) {
                utl.embed.ping(msg, sMsg, 'не указан пользователь!')
                return
            }
            if(!args[2]) {
                utl.embed.ping(msg, sMsg, 'не указан индекс варна!')
                return
            }
            if(!Number.isInteger(Number(args[2]))) {
                utl.embed.ping(msg, sMsg, 'указан неверный индекс варна!')
                return
            }

            const user = await new DBUser(msg.guild.id, mMember.id)
            const index = Number(args[2]) - 1

            if(!user.warns) {
                utl.embed.ping(msg, sMsg, `у пользователя <@${mMember.user.id}> нет предупреждений`)
                return
            }
            if(!user.warns[index]) {
                utl.embed.ping(msg, sMsg, `у пользователя <@${mMember.user.id}> нет такого предупреждения`)
                return
            }

            const warn = user.warns[index].reason
            user.warns.splice(index, 1)
            await user.save()

            utl.embed(msg, sMsg, `Предупреждения для пользователя <@${mMember.user.id}> обновлены!`)
            utl.actionLogs.modLog(client.guild, 'unwarn', msg.member, mMember, msg.createdTimestamp, warn)
        } else
            utl.embed(msg, sMsg, 'У Вас нет прав для этой команды!')

    }
module.exports.allowedInGeneral = true