const { Message, MessageEmbed, Client } = require('discord.js')
const { embed, db, reactionSelector } = require('../../utility')
const { DBServer } = db
const constants = require('../../constants.json')
const sMsg = 'Заявка на личную комнату'

module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Message} msg Discord message object
    * @param {Client} client Discord client object
    * Usage: .pcreate name  
    */
    async (args, msg, client) => {
        const server = await new DBServer(msg.guild.id)
        if(server.personaRooms.find(p => p.creator == msg.author.id)) {
            embed.ping(msg, sMsg, 'на Ваше имя уже зарегистрирована личная комната!')
            return
        }

        const name = args[1]
        if(!name) {
            embed.ping(msg, sMsg, 'не указано имя комнаты!')
            return
        }
        const m = await embed.ping(msg, sMsg, 'Вы уверены, что хотите отправить заявку на личную комнату? Минимальный размер группы от 4-х человек')
        reactionSelector.yesNo(m, msg.author.id,
            () => {
                const requestID = Math.floor(Math.random() * (9999 - 1000) + 1000)
                const request = new MessageEmbed(
                    {
                        "title": "Новый запрос на создание личной комнаты",
                        "color": 431075,
                        "footer": {
                            "text": `ID: ${requestID}`
                        },
                        "fields": [
                            {
                                "name": "Автор запроса:",
                                "value": `${msg.author}`,
                                "inline": true
                            },
                            {
                                "name": "Название комнаты:",
                                "value": `\`\`\`${name}\`\`\``,
                                "inline": true
                            }
                        ]
                    }
                )
                msg.guild.channels.cache.get(constants.channels.prmsRequests).send(request)
                    .then(async m => {
                        await m.react('✅')
                        await m.react('❌')
                    })
                m.delete()
                embed.ping(msg, sMsg, 'Заявка успешно отправлена модераторам на рассмотрение! Они свяжутся с Вами для обсуждения деталей комнаты.')
            },
            () => {
                m.delete()
            },
            () => {
                m.delete()
            }
        )
    }
module.exports.allowedInGeneral = true