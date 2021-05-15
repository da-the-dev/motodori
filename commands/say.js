const Discord = require('discord.js')
const utl = require('../utility')
const sMsg = 'Эмбед-билдер'
module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .say <jsonData>
    */
    (args, msg, client) => {
        args = args.join(' ').split('\n')
        args.shift()

        var stringData = args.join('\n')
        var jsonData = {}
        if(stringData == "") {
            utl.embed(msg, sMsg, '\n[EmbedBuilder](https://embedbuilder.nadekobot.me/)\n\n\n\n')
            return
        }

        try {
            jsonData = JSON.parse(stringData)
        } catch(err) {
            utl.embed.ping(msg, sMsg, 'Некорректные данные для эмбеда!')
            return
        }

        const embed = new Discord.MessageEmbed(jsonData)
            .setThumbnail(jsonData.thumbnail)
            .setImage(jsonData.image)
        msg.channel.send({
            content: jsonData.plainText,
            embed: embed
        })
        // if(jsonData.plainText) msg.channel.send(jsonData.plainText)
        // else msg.channel.send(embed)
    }
module.exports.allowedInGeneral = true