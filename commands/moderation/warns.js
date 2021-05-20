const Discord = require('discord.js')
const utl = require('../../utility')
const constants = require('../../constants.json')
const { DBUser, getConnection } = utl.db
const sMsg = 'История предупреждений'
module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .warns <?member>
    */
    async (args, msg, client) => {
        const mMember = msg.mentions.members.first()
        if(!mMember) {
            const user = await new DBUser(msg.guild.id, msg.author.id, getConnection())
            console.log(user.get())
            var embed = utl.embed.build(msg, `${sMsg} • ${msg.member.displayName}`)
            if(!user.warns) {
                utl.embed(msg, sMsg, `У Вас нет предупреждений`)
                return
            }

            for(i = 0; i < user.warns.length; i++) {
                var w = user.warns[i]
                var date = new Date(new Date(w.time).toLocaleString("en-US", { timeZone: "Europe/Moscow" }))
                embed.addField('Дата выдачи', `**${i + 1}.** — ${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear().toString().slice(2)} в ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`, true)
                embed.addField(`Исполнитель`, `<@${w.who}>`, true)
                embed.addField(`Причина`, `${w.reason}`, true)
            }
            msg.channel.send(embed)
        } else {
            if(utl.roles.privilage(msg.member, msg.guild.roles.cache.get(constants.roles.chatControl))) {
                const user = await new DBUser(msg.guild.id, mMember.id, getConnection())
                var embed = utl.embed.build(msg, `${sMsg} • ${mMember.displayName}`)
                if(!user.warns) {
                    utl.embed(msg, sMsg, `У Вас нет предупреждений`)
                    return
                }

                for(i = 0; i < user.warns.length; i++) {
                    var w = user.warns[i]
                    var date = new Date(new Date(w.time).toLocaleString("en-US", { timeZone: "Europe/Moscow" }))
                    embed.addField('Дата выдачи', `**${i + 1}.** — ${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear().toString().slice(2)} в ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`, true)
                    embed.addField(`Исполнитель`, `<@${w.who}>`, true)
                    embed.addField(`Причина`, `${w.reason}`, true)
                }
                msg.channel.send(embed)
            } else {
                utl.embed.ping(msg, sMsg, `у Вас нет прав просматривать чужие варны!`)
            }
        }
    }