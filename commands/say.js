const Discord = require('discord.js')
const utl = require('../utility')
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
            utl.embed(msg, '\n`安`[EmbedBuilder](https://embedbuilder.nadekobot.me/)\n\n\n\n')
            return
        }

        try {
            jsonData = JSON.parse(stringData)
        } catch(err) {
            utl.embed(msg, 'Некорректные данные для эмбеда!')
            return
        }

        var embed = new Discord.MessageEmbed(jsonData)
        if(jsonData.image) embed.setImage(jsonData.image)
        if(jsonData.plainText) msg.channel.send(jsonData.plainText)
        else msg.channel.send(embed)
    }
module.exports.allowedInGeneral = true