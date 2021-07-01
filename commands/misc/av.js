const Discord = require('discord.js')
const utl = require('../../utility')
const sMsg = 'Просмотр аватара'
module.exports =
    /**
     * @param {Array<string>} args Command argument
     * @param {Discord.Message} msg Discord message object
     * @param {Discord.Client} client Discord client object
     * @description Usage: .av <?member>
     */
    (args, msg, client) => {
        const mMember = msg.mentions.members.first()
        if(!mMember) {
            const embed = utl.embed.build(msg, `${sMsg} ${msg.author.tag}`)
                .setThumbnail()
            embed.setImage(msg.author.displayAvatarURL({ dynamic: true }) + '?size=2048')
            msg.channel.send(embed)
        } else {
            const embed = utl.embed.build(msg, `${sMsg} ${mMember.user.tag}`)
                .setThumbnail()
            embed.setImage(mMember.user.displayAvatarURL({ dynamic: true }) + '?size=2048')
            msg.channel.send(embed)
        }
    }
