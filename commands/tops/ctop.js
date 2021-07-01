const Discord = require('discord.js')
const utl = require('../../utility')
const { getGuild } = utl.db

const topAmount = 10

module.exports =
    /**
     * @param {Array<string>} args Command argument
     * @param {Discord.Message} msg Discord message object
     * @param {Discord.Client} client Discord client object
     * @example Usage: .ctop
     */
    async (args, msg, client) => {
        let guild = await getGuild(msg.guild.id)

        guild = guild.filter(u => u.msgs)
        guild.sort((a, b) => {
            if(a.msgs > b.msgs) return -1
            if(a.msgs < b.msgs) return 1
            return 0
        })

        const embed = utl.embed.build(msg, 'Топ пользователей по текстовому активу')
        let description = ''

        const valids = []
        for(let i = 0; i < guild.length; i++) {
            if(valids.length <= topAmount) {
                const member = msg.guild.member(guild[i].id)
                if(member)
                    valids.push({ member: member, msgs: guild[i].msgs })
            }
        }

        for(let i = 0; i < topAmount; i++) {
            switch(i) {
                case 0:
                    description += `\`🥇\` • <@${valids[i].member.id}> — **${valids[i].msgs}**\n`
                    break
                case 1:
                    description += `\`🥈\` • <@${valids[i].member.id}> — **${valids[i].msgs}**\n`
                    break
                case 2:
                    description += `\`🥉\` • <@${valids[i].member.id}> — **${valids[i].msgs}**\n`
                    break
                default:
                    description += `\`💭\` • <@${valids[i].member.id}> — **${valids[i].msgs}**\n`
                    break
            }
        }

        embed.setDescription(description)
        msg.channel.send(embed)
    }