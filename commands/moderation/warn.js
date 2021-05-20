const Discord = require('discord.js')
const utl = require('../../utility')
const { DBUser, Connection, getConnection } = utl.db
const constants = require('../../constants.json')
const sMsg = 'Выдача предупреждения'
module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .warn <member> <reason>
    */
    async (args, msg, client) => {
        if(utl.roles.privilage(msg.member, msg.guild.roles.cache.get(constants.roles.chatControl))) {
            var mMember = msg.mentions.members.first()
            if(!mMember) {
                utl.embed(msg, sMsg, 'Вы не указали пользователя для варна!')
                return
            }

            args.shift()
            args.shift()

            var reason = args.join(" ").trim()
            if(!reason) {
                utl.embed(msg, sMsg, 'Вы не указали причину варна!')
                return
            }

            const user = await new DBUser(msg.guild.id, mMember.id, getConnection())

            if(user.warns && user.warns.length == 5) {
                // Set shadow key
                const rClient = require('redis').createClient(process.env.RURL)
                rClient.set('muted-' + mMember.user.id, true)
                rClient.expire('muted-' + mMember.user.id, 3 * 24 * 60 * 60)

                utl.db.createClient(process.env.MURL).then(async db => {
                    var user = await db.get(msg.guild.id, mMember.id)
                    user.mute = true
                    await db.set(msg.guild.id, mMember.id, user)
                    db.close()
                })
                delete user.warns
                mMember.roles.add(constants.roles.muted)
            }
            console.log(user.warns)
            !user.warns ? user.warns = [{ 'reason': reason, 'who': msg.author.id, 'time': msg.createdTimestamp }] : user.warns.push({ 'reason': reason, 'who': msg.author.id, 'time': msg.createdTimestamp })
            await user.save()
            console.log(user.warns)

            utl.embed(msg, sMsg, `Пользователю <@${mMember.user.id}> выдано предупреждение \n\`\`\`Elm\nПричина: ${reason}\n\`\`\``)
            utl.moderatorLog.log(msg, 'warn', msg.member, mMember, msg.createdTimestamp, reason)
        } else {
            utl.embed(msg, sMsg, 'У Вас нет прав для этой команды!')
        }
    }
module.exports.allowedInGeneral = true