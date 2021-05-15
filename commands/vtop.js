const Discord = require('discord.js')
const utl = require('../utility')
const constants = require('../constants.json')

const topAmount = 10
module.exports =
    /**
     * @param {Array<string>} args Command argument
     * @param {Discord.Message} msg Discord message object
     * @param {Discord.Client} client Discord client object
     * @description Usage: .vtop
     */
    async (args, msg, client) => {
        utl.db.createClient(process.env.MURL).then(db => {
            db.getGuild(msg.guild.id).then(data => {
                db.close()

                data = data.filter(d => d.voiceTime)
                data.sort((a, b) => {
                    if(a.voiceTime > b.voiceTime) return -1
                    if(a.voiceTime < b.voiceTime) return 1
                    return 0
                })

                var embed = utl.embed.build(msg, 'Топ пользователей по голосовому онлайну')

                var description = ''

                var valids = []
                for(i = 0; i < data.length; i++) {
                    if(valids.length <= topAmount) {
                        var member = msg.guild.member(data[i].id)
                        if(member)
                            valids.push({ member: member, voiceTime: data[i].voiceTime })
                    }
                }

                for(i = 0; i < valids.length; i++) {
                    switch(i) {
                        case 0:
                            description += `\`🥇\` • <@${valids[i].member.id}> — ${utl.time.timeCalculator(valids[i].voiceTime)}\n`
                            break
                        case 1:
                            description += `\`🥈\` • <@${valids[i].member.id}> — ${utl.time.timeCalculator(valids[i].voiceTime)}\n`
                            break
                        case 2:
                            description += `\`🥉\` • <@${valids[i].member.id}> — ${utl.time.timeCalculator(valids[i].voiceTime)}\n`
                            break
                        default:
                            description += `\`🕓\` • <@${valids[i].member.id}> — ${utl.time.timeCalculator(valids[i].voiceTime)}\n`
                            break
                    }
                }

                embed.setDescription(description)
                msg.reply(embed)
            })
        })
    }