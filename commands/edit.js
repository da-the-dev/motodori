const Discord = require('discord.js')
const utl = require('../utility')
const sMsg = 'Редактирование эмбеда'
module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .edit <id>\n<jsonData>
    */
    (args, msg, client) => {
        args.shift()
        args = args.join(' ').split('\n')

        var messageID = args[0]
        args.shift()
        if(!messageID) {
            utl.embed.ping(msg, sMsg, 'не указан ID эмбеда!')
            return
        }

        var stringData = args.join('\n').trim()
        var jsonData = {}
        if(!stringData) {
            utl.embed.ping(msg, sMsg, 'Вы не указали данные для эмбеда!')
            return
        }

        try {
            jsonData = JSON.parse(stringData)
        } catch(err) {
            utl.embed.ping(msg, sMsg, 'некорректные данные для эмбеда!')
            return
        }

        msg.channel.messages.fetch(messageID)
            .then(m => {
                if(m) {
                    const embed = new Discord.MessageEmbed(jsonData)
                        .setThumbnail(jsonData.thumbnail)
                        .setImage(jsonData.image)
                    m.edit({
                        content: jsonData.plainText,
                        embed: embed
                    })
                } else
                    utl.embed.ping(msg, sMsg, 'не найдено сообщение! Проверьте ID!')
            })
    }
module.exports.allowedInGeneral = true