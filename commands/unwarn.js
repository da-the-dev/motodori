const Discord = require('discord.js')
const utl = require('../utility')
const constants = require('../constants.json')
const { pillar, warn } = require('../constants.json').emojies
const emojies = ['1️⃣', '2️⃣', '3️⃣']
const sMsg = 'Снятие предупреждений'
module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .unwarn <member>
    */
    (args, msg, client) => {
        var chatControlRole = msg.guild.roles.cache.get(constants.roles.chatControl)
        if(msg.member.roles.cache.find(r => r.position >= chatControlRole.position)) {
            var mMember = msg.mentions.members.first()
            if(!mMember) {
                utl.embed(msg, sMsg, 'Не указан пользователь!')
                return
            }

            utl.db.createClient(process.env.MURL).then(db => {
                db.get(msg.guild.id, mMember.user.id).then(userData => {
                    if(userData) {
                        if(!userData.warns || userData.warns.length == 0) {
                            utl.embed(msg, sMsg, `${pillar}${warn}${pillar}У пользователя <@${mMember.user.id}> нет предупреждений`)
                            db.close()
                            return
                        }
                        var embed = utl.embed.build(msg, `${sMsg} • ${mMember.displayName}`)

                        for(i = 0; i < userData.warns.length; i++) {
                            var w = userData.warns[i]
                            var date = new Date(w.time)
                            embed.addField('Дата выдачи', `**${i + 1}.** — ${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear().toString().slice(2)} в ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`, true)
                            embed.addField(`Исполнитель`, `<@${w.who}>`, true)
                            embed.addField(`Причина`, `${w.reason}`, true)
                        }

                        msg.channel.send(embed)
                            .then(async m => {
                                for(i = 0; i < userData.warns.length; i++)
                                    await m.react(emojies[i])
                                const filter = (reaction, user) => user.id == msg.author.id
                                m.awaitReactions(filter, { time: 60000, max: 1, errors: 'time' })
                                    .then(reactions => {
                                        if(reactions.array().length > 0) {
                                            db.get(msg.guild.id, mMember.id).then(userData => {
                                                console.log(userData.warns, emojies.indexOf(reactions.first().emoji.name))
                                                userData.warns.splice(emojies.indexOf(reactions.first().emoji.name), 1)
                                                console.log(userData.warns)

                                                db.set(msg.guild.id, mMember.id, userData).then(() => {
                                                    db.close()
                                                    m.edit(utl.embed.build(msg, sMsg, `Предупреждения для пользователя <@${mMember.user.id}> обновлены!`))
                                                    m.reactions.removeAll()
                                                })
                                            })
                                        }
                                    })
                            })
                    } else {
                        utl.embed(msg, sMsg, `У пользователя <@${mMember.user.id}> нет предупреждений`)
                        db.close()
                    }
                })
            })
        } else {
            utl.embed(msg, sMsg, 'У Вас нет прав для этой команды!')
        }
    }
module.exports.allowedInGeneral = true