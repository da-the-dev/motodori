const Discord = require('discord.js')
const utl = require('../utility')
const { dot, sweet } = require('../constants.json').emojies

module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .p
    */
    (args, msg, client) => {
        // Member to get the profile of
        var pMember = msg.member
        var mMember = msg.mentions.members.first()
        if(mMember)
            pMember = mMember


        utl.db.createClient(process.env.MURL).then(db => {
            db.get(msg.guild.id, pMember.id).then(userData => {
                var embed = utl.embed.build(msg, `Профиль — ${pMember.user.tag}`, `> **Статус:**\n\`\`\`${userData.status || 'Не установлен'}\`\`\``)
                    .addFields([
                        {
                            "name": "> Баланс:",
                            "value": `\`\`\`${userData.money || 0}\`\`\``,
                            "inline": true
                        },
                        {
                            "name": "> Голосовой онлайн:",
                            "value": `\`\`\`${utl.time.timeCalculator(userData.voiceTime || 0).replace(/[**]/g, '')}\`\`\``,
                            "inline": true
                        },

                        {
                            "name": "> Партнер:",
                            "value": `\`\`\`${userData.loveroom ? `${msg.guild.member(userData.loveroom.partner).displayName}` : 'Нет'}\`\`\``,
                            "inline": true
                        }
                    ])

                msg.channel.send(embed)
                db.close()
            })
        })
    }