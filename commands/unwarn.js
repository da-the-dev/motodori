const Discord = require('discord.js')
const utl = require('../utility')
const { DBUser, Connection } = utl.db
const constants = require('../constants.json')
const emojies = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣']
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

            const con = await new Connection()
            const user = await new DBUser(msg.guild.id, mMember.id, con)

            if(!user.warns) {
                utl.embed(msg, sMsg, `У пользователя <@${mMember.user.id}> нет предупреждений`)
                con.close()
                return
            }

            var embed = utl.embed.build(msg, `${sMsg} • ${mMember.displayName}`)

            for(i = 0; i < user.warns.length; i++) {
                var w = user.warns[i]
                var date = new Date(w.time)
                embed.addField('Дата выдачи', `**${i + 1}.** — ${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear().toString().slice(2)} в ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`, true)
                embed.addField(`Исполнитель`, `<@${w.who}>`, true)
                embed.addField(`Причина`, `${w.reason}`, true)
            }

            /**
             * Removes a warns
             * @param {number} index 
             */
            async function removeWarn(index) {
                user.warns = user.warns.splice(index - 1, 1)
                await user.save()
                con.close()
            }
            msg.channel.send(embed)
                .then(async m => {
                    utl.reactionSelector.multiselector(msg, msg.author.id,
                        () => {
                            removeWarn(1)
                        },
                        () => {
                            removeWarn(2)
                        },
                        () => {
                            removeWarn(3)
                        },
                        () => {
                            removeWarn(4)
                        },
                        () => {
                            removeWarn(5)
                        },
                        cancel = () => {
                            m.delete()
                        },
                        fail = () => {
                            m.delete()
                        }
                    )
                })

        } else {
            utl.embed(msg, sMsg, 'У Вас нет прав для этой команды!')
        }
    }
module.exports.allowedInGeneral = true