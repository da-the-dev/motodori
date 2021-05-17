const Discord = require('discord.js')
const utl = require('../utility')
const { DBUser, Connection } = utl.db
const { dot, sweet } = require('../constants.json').emojies

module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .p
    */
    async (args, msg, client) => {
        // Member to get the profile of
        var pMember = msg.member
        var mMember = msg.mentions.members.first()
        if(mMember)
            pMember = mMember

        const con = await new Connection()
        const user = await new DBUser(msg.guild.id, msg.author.id, con)
        con.close()

        var embed = utl.embed.build(msg, `Профиль — ${pMember.user.tag}`, `> **Статус:**\n\`\`\`${user.status || 'Не установлен'}\`\`\``)
            .addFields([
                {
                    "name": "> Баланс:",
                    "value": `\`\`\`${user.money || 0}\`\`\``,
                    "inline": true
                },
                {
                    "name": "> Голосовой онлайн:",
                    "value": `\`\`\`${utl.time.timeCalculator(user.voiceTime || 0).replace(/[**]/g, '')}\`\`\``,
                    "inline": true
                },

                {
                    "name": "> Партнер:",
                    "value": `\`\`\`${user.loveroom ? `${msg.guild.member(user.loveroom.partner).displayName}` : 'Нет'}\`\`\``,
                    "inline": true
                }
            ])

        msg.channel.send(embed)
    }