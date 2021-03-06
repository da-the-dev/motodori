const Discord = require('discord.js')
const utl = require('../../utility')
const constants = require('../../constants.json')
const sMsg = 'Редактирование эмбеда'
module.exports =
    /**
     * @param {Array<string>} args Command argument
     * @param {Discord.Message} msg Discord message object
     * @param {Discord.Client} client Discord client object
     * @example Usage: .edit <id>\n<jsonData>
     */
    (args, msg, client) => {
        if(utl.roles.privilage(msg.member, msg.guild.roles.cache.get(constants.roles.curator))) {
            args.shift()
            args = args.join(' ').split('\n')

            const messageID = args[0]
            args.shift()
            if(!messageID) {
                utl.embed.ping(msg, sMsg, 'не указан ID эмбеда!')
                return
            }

            const stringData = args.join('\n').trim()
            let jsonData = {}
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
                        if(jsonData.plainText && Object.keys(jsonData).length == 1) {
                            m.edit(jsonData.plainText)
                        } else {
                            const embed = new Discord.MessageEmbed(jsonData)
                                .setThumbnail(jsonData.thumbnail)
                                .setImage(jsonData.image)
                            m.edit({
                                content: jsonData.plainText,
                                embed: embed
                            })
                        }
                    } else
                        utl.embed.ping(msg, sMsg, 'не найдено сообщение! Проверьте ID!')
                })
        } else {
            utl.embed.ping(msg, '.say', 'у Вас нет прав на эту команду!')
        }
    }
module.exports.allowedInGeneral = true