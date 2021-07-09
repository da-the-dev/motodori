const Discord = require('discord.js')
const utl = require('../../utility')
const { DBUser } = utl.db

module.exports =
    /**
     * @param {Array<string>} args Command argument
     * @param {Discord.Message} msg Discord message object
     * @param {Discord.Client} client Discord client object
     * @example Usage: .p
     */
    async (args, msg, client) => {
        // Member to get the profile of
        let pMember = msg.member
        const mMember = msg.mentions.members.first()
        if(mMember)
            pMember = mMember

        const user = await new DBUser(msg.guild.id, pMember.id)

        const embed = utl.embed.build(msg, `Профиль — ${pMember.user.tag}`, `> **状態 Status:**\n\`\`\`${user.status || 'Не установлен'}\`\`\``)
            .addFields([
                {
                    'name': '> Yen Balance:',
                    'value': `\`\`\`${user.money || 0}\`\`\``,
                    'inline': true
                },
                {
                    'name': '> Voice activity:',
                    'value': `\`\`\`${utl.time.timeCalculator(user.voiceTime || 0).replace(/[**]/g, '') || '0 м'}\`\`\``,
                    'inline': true
                },

                {
                    'name': '> Chat activity:',
                    'value': `\`\`\`${user.msgs || 0}\`\`\``,
                    'inline': true
                }
            ])

        msg.channel.send(embed)
    }