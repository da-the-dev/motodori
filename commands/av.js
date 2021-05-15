const Discord = require('discord.js')
const utl = require('../utility')
const { dot } = require('../constants.json').emojies
const sMsg = 'Просмотр аватара'
module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .av <member>
    */
    (args, msg, client) => {
        var mMember = msg.mentions.members.first()
        if(mMember) {
            var embed = new Discord.MessageEmbed()
                .setTitle(`${dot}Просмотр аватара`)
                .setDescription(`**${mMember.user.tag}**`)
                .setColor('#2F3136')
            embed.setImage(mMember.user.displayAvatarURL({ dynamic: true }) + "?size=2048")
        } else {
            utl.embed.ping(msg, sMsg, 'не указан пользователь!')
            return
        }

        msg.channel.send(embed)
    }
