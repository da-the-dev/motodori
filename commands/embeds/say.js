const Discord = require('discord.js')
const utl = require('../../utility')
const constants = require('../../constants.json')

const sMsg = 'Эмбед-билдер'
module.exports =
    /**
     * @param {Array<string>} args Command argument
     * @param {Discord.Message} msg Discord message object
     * @param {Discord.Client} client Discord client object
     * @example Usage: .say <jsonData>
     */
    (args, msg, client) => {
        if(utl.roles.privilage(msg.member, msg.guild.roles.cache.get(constants.roles.curator))) {
            args = args.join(' ').split('\n')
            args.shift()

            const stringData = args.join('\n')
            let jsonData = {}
            if(stringData == '') {
                utl.embed(msg, sMsg, '\n[EmbedBuilder](https://embedbuilder.nadekobot.me/)\n\n\n\n')
                return
            }

            try {
                jsonData = JSON.parse(stringData)
            } catch(err) {
                utl.embed.ping(msg, sMsg, 'Некорректные данные для эмбеда!')
                return
            }

            if(jsonData.plainText && Object.keys(jsonData).length == 1) {
                msg.channel.send(jsonData.plainText || 'Сообщение было пустым')
                    .catch(err => {
                        msg.channel.send(err)
                    })
            } else {
                const embed = new Discord.MessageEmbed(jsonData)
                    .setThumbnail(jsonData.thumbnail)
                    .setImage(jsonData.image)

                msg.channel.send({
                    content: jsonData.plainText,
                    embed: embed
                }).catch(err => {
                    msg.channel.send(err)
                })
            }
            // if(jsonData.plainText) msg.channel.send(jsonData.plainText)
            // else msg.channel.send(embed)
        } else
            utl.embed.ping(msg, sMsg, 'у Вас нет прав на эту команду!')
    }
module.exports.allowedInGeneral = true