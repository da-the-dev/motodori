const Discord = require('discord.js')
const utl = require('../../utility')
const { DBUser } = utl.db
const { getRedCon } = utl.redisConnection
const constants = require('../../constants.json')
const sMsg = 'Выдача предупреждения'
module.exports =
    /**
     * @param {Array<string>} args Command argument
     * @param {Discord.Message} msg Discord message object
     * @param {Discord.Client} client Discord client object
     * @example Usage: .warn <member> <reason>
     */
    async (args, msg, client) => {
        if(utl.roles.privilage(msg.member, msg.guild.roles.cache.get(constants.roles.chatControl))) {
            const mMember = msg.mentions.members.first()
            if(!mMember) {
                utl.embed(msg, sMsg, 'Вы не указали пользователя для варна!')
                return
            }

            args.shift()
            args.shift()

            const reason = args.join(' ').trim()
            if(!reason) {
                utl.embed(msg, sMsg, 'Вы не указали причину варна!')
                return
            }

            const user = await new DBUser(msg.guild.id, mMember.id)
            if(user.warns && user.warns.length == 5) {
                await getRedCon().set(`mute-${mMember.id}`, '')
                getRedCon().expire(`mute-${mMember.id}`, 3 * 24 * 60 * 60)

                user.mute = true
                user.warns = []

                mMember.roles.add(constants.roles.muted)
            }

            user.warns.push({ 'reason': reason, 'who': msg.author.id, 'time': msg.createdTimestamp })
            user.save()

            utl.embed(msg, sMsg, `Пользователю <@${mMember.user.id}> выдано предупреждение \n\`\`\`Elm\nПричина: ${reason}\n\`\`\``)
            utl.actionLogs.modLog(client.guild, 'warn', msg.member, mMember, msg.createdTimestamp, reason)
        } else {
            utl.embed(msg, sMsg, 'У Вас нет прав для этой команды!')
        }
    }
module.exports.allowedInGeneral = true