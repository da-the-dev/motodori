const Discord = require('discord.js')
const utl = require('../utility')
const { getGuild, Connection } = utl.db
const constants = require('../constants.json')
const { sweet } = constants.emojies

const topAmount = 10
module.exports =
    /**
     * @param {Array<string>} args Command argument
     * @param {Discord.Message} msg Discord message object
     * @param {Discord.Client} client Discord client object
     * @description Usage: .btop
     */
    async (args, msg, client) => {

        const con = await new Connection()
        var guild = await getGuild(msg.guild.id, con)
        con.close()

        guild = guild.filter(u => u.money)
        guild.sort((a, b) => {
            if(a.money > b.money) return -1
            if(a.money < b.money) return 1
            return 0
        })

        var embed = utl.embed.build(msg, 'Топ пользователей по балансу')
        var description = ''

        var valids = []
        for(i = 0; i < guild.length; i++) {
            if(valids.length <= topAmount) {
                var member = msg.guild.member(guild[i].id)
                if(member)
                    valids.push({ member: member, money: guild[i].money })
            }
        }

        for(i = 0; i < topAmount; i++) {
            switch(i) {
                case 0:
                    description += `\`🥇\` • <@${valids[i].member.id}> — **${valids[i].money}** ${sweet}\n`
                    break
                case 1:
                    description += `\`🥈\` • <@${valids[i].member.id}> — **${valids[i].money}** ${sweet}\n`
                    break
                case 2:
                    description += `\`🥉\` • <@${valids[i].member.id}> — **${valids[i].money}** ${sweet}\n`
                    break
                default:
                    description += `\`💰\` • <@${valids[i].member.id}> — **${valids[i].money}** ${sweet}\n`
                    break
            }
        }

        embed.setDescription(description)
        msg.channel.send(embed)
    }
