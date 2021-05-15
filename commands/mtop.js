const Discord = require('discord.js')
const utl = require('../utility')
const constants = require('../constants.json')

const topAmount = 10

module.exports =
    /**
     * @param {Array<string>} args Command argument
     * @param {Discord.Message} msg Discord message object
     * @param {Discord.Client} client Discord client object
     * @description Usage: .mtop
     */
    async (args, msg, client) => {
        // Disabled
        return
        utl.db.createClient(process.env.MURL).then(db => {
            db.getGuild('718537792195657798').then(data => {
                db.close()

                data = data.filter(d => d.dayMsgs || d.nightMsgs)
                var idsNMessages = data.map(d => { return { id: d.id, msgs: d.dayMsgs || 0 + d.nightMsgs || 0 } })
                idsNMessages.sort((a, b) => {
                    if(a.msgs > b.msgs) return -1
                    if(a.msgs < b.msgs) return 1
                    return 0
                })
                var valids = []
                for(i = 0; i < idsNMessages.length; i++) {
                    if(valids.length <= topAmount) {
                        var member = msg.guild.member(idsNMessages[i].id)
                        if(member) {
                            valids.push({ member: member, msgs: idsNMessages[i].msgs })
                            console.log('found member')
                        }
                    }
                }

                var embed = new Discord.MessageEmbed()
                    .setTitle('<a:__:825834909146415135> Топ 10 пользователей по сообщениям')
                    .setColor('#2F3136')
                    .setFooter(`${msg.author.tag} • ${utl.embed.calculateTime(msg)}`, msg.author.avatarURL())

                var description = ''

                for(i = 0; i < topAmount; i++) {
                    switch(i) {
                        case 0:
                            description += `\`🥇\` ${valids[i].member.displayName} — **${valids[i].msgs}** <:__:831618586338263071>\n`
                            break
                        case 1:
                            description += `\`🥈\` ${valids[i].member.displayName} — **${valids[i].msgs}** <:__:831618586338263071>\n`
                            break
                        case 2:
                            description += `\`🥉\` ${valids[i].member.displayName} — **${valids[i].msgs}** <:__:831618586338263071>\n`
                            break
                        default:
                            description += `\`💭\` ${valids[i].member.displayName} — **${valids[i].msgs}** <:__:831618586338263071>\n`
                            break
                    }
                }

                embed.setDescription(description)
                msg.reply(embed)
            })
        })
    }