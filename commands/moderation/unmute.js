const { Message, Client } = require('discord.js')
const { db, embed, redisConnection, roles } = require('../../utility')
const { DBUser } = db
const { getRedCon } = redisConnection
const constants = require('../../constants.json')
const sMsg = 'Снятие мута'

module.exports =
    /**
     * @param {Array<string>} args Command argument
     * @param {Message} msg Discord message object
     * @param {Client} client Discord client object
     * @description Usage: .unmute <member>
     */
    async (args, msg, client) => {
        if(roles.privilage(msg.member, msg.guild.roles.cache.get(constants.roles.chatControl))) {
            var mMember = msg.mentions.members.first()
            if(!mMember) {
                embed(msg, sMsg, 'Вы не указали пользователя для мута!')
                return
            }

            await getRedCon().delete(`mute-${mMember.id}`)

            const user = await new DBUser(mMember.guild.id, mMember.id)
            user.mute = false
            user.save()

            mMember.roles.remove(constants.roles.muted)

            embed(msg, sMsg, `<@${mMember.user.id}> был(-а) размьючен(-а)`)
        } else {
            embed(msg, sMsg, 'У Вас нет прав для этой команды!')
        }
    }
module.exports.allowedInGeneral = true