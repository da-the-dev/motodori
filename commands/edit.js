const Discord = require('discord.js')
const utl = require('../utility')
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
            utl.embed(msg, 'Не указан ID эмбеда!')
            return
        }

        var stringData = args.join('\n').trim()
        var jsonData = {}
        if(!stringData) {
            utl.embed(msg, 'Вы не указали данные для эмбеда!')
            return
        }

        try {
            jsonData = JSON.parse(stringData)
        } catch(err) {
            utl.embed(msg, 'Некорректные данные для эмбеда!')
            return
        }

        msg.channel.messages.fetch(messageID)
            .then(c => {
                if(c) {
                    var embed = new Discord.MessageEmbed(jsonData)
                    if(jsonData.image) embed.setImage(jsonData.image)
                    if(jsonData.plainText) c.edit(jsonData.plainText, embed)
                    else c.edit(embed)
                } else {
                    utl.embed(msg, 'Не найдено сообщение! Проверьте ID!')
                }
            })
    }
module.exports.allowedInGeneral = true