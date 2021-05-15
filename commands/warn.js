const Discord = require('discord.js')
const utl = require('../utility')
const constants = require('../constants.json')
const { pillar, warn } = require('../constants.json').emojies
const sMsg = 'Выдача предупреждения'
module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .warn <member> <reason>
    */
    (args, msg, client) => {
        var cControlRole = msg.guild.roles.cache.get(constants.roles.chatControl)
        if(msg.member.roles.cache.find(r => r.position >= cControlRole.position)) {
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

            utl.db.createClient(process.env.MURL).then(db => {
                db.get(msg.guild.id, mMember.id).then(userData => {
                    if(userData.warns && userData.warns.length == 3)
                        delete userData.warns

                    if(!userData.warns)
                        userData.warns = [{ 'reason': reason, 'who': msg.author.id, 'time': msg.createdTimestamp }]
                    else
                        userData.warns.push({ 'reason': reason, 'who': msg.author.id, 'time': msg.createdTimestamp })

                    db.set(msg.guild.id, mMember.user.id, userData).then(() => {
                        utl.embed(msg, sMsg, `${pillar}${warn}${pillar}Пользователю <@${mMember.user.id}> выдано предупреждение \n\`\`\`Elm\nПричина: ${reason}\n\`\`\``)
                        db.close()
                    })
                })
            })
        } else {
            utl.embed(msg, sMsg, 'У Вас нет прав для этой команды!')
        }
    }
module.exports.allowedInGeneral = true