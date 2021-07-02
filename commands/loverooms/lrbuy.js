const Discord = require('discord.js')
const { db, embed, reactionSelector } = require('../../utility')
const { DBUser } = db
const constants = require('../../constants.json')
const { sweet } = constants.emojies

const sMsg = 'Создание любовной комнаты'
module.exports =
    /**
     * @param {Array<string>} args Command argument
     * @param {Discord.Message} msg Discord message object
     * @param {Discord.Client} client Discord client object
     * @description Usage: .lrbuy 
     */
    async (args, msg, client) => {
        const user = await new DBUser(msg.guild.id, msg.member.id)
        if(!user.mate) {
            embed(msg, sMsg, 'У Вас нет пары!')
            return
        }

        if(user.loveroom) {
            embed(msg, sMsg, 'У Вас уже есть любовная комната!')
            return
        }

        if(user.money < 7000) {
            embed(msg, sMsg, `У Вас недостачно ${sweet} для покупки любовной комнаты!`)
            return
        }

        const mateMember = msg.guild.member(user.mate)
        const mateDB = await new DBUser(msg.guild.id, mateMember.id)
        embed(msg, sMsg, `<@${user.mate}>, <@${msg.member.id}> хочет создать с тобой любовную комнату, что ответишь?\nСтоимость комнаты **10.000** ${sweet}`)
            .then(async m => {
                reactionSelector.yesNo(m, user.mate,
                    async () => {
                        const c = await m.guild.channels.create(`${msg.author.username} ❤ ${mateMember.user.username}`, {
                            type: 'voice',
                            permissionOverwrites:
                                [
                                    {
                                        id: msg.guild.id,
                                        deny: ['CONNECT']
                                    },
                                    {
                                        id: constants.roles.verify,
                                        deny: ['VIEW_CHANNEL', 'CONNECT']
                                    },
                                    {
                                        id: constants.roles.localban,
                                        deny: ['VIEW_CHANNEL', 'CONNECT']
                                    },
                                    {
                                        id: msg.author.id,
                                        allow: ['VIEW_CHANNEL', 'CONNECT']
                                    },
                                    {
                                        id: user.mate,
                                        allow: ['VIEW_CHANNEL', 'CONNECT']
                                    }
                                ],
                            parent: '854418739322421248',
                            userLimit: 2
                        })

                        mateMember.roles.add(constants.roles.loveroom)
                        msg.member.roles.add(constants.roles.loveroom)

                        user.money -= 7000
                        user.loveroom = { id: c.id, partner: mateMember.id, creationDate: Date.now() }
                        mateDB.loveroom = { id: c.id, partner: mateMember.id, creationDate: Date.now() }

                        await Promise.all([
                            user.save(),
                            mateDB.save()
                        ])

                        m.reactions.removeAll()
                        return
                    },
                    () => {
                        m.edit(embed.build(msg, sMsg, `<@${mateMember.id}> тебе отказал(-а)`))
                        m.reactions.removeAll()
                    },
                    () => {
                        m.edit(embed.build(msg, sMsg, `<@${mateMember.id}> тебя проигнорировал(-а)`))
                        m.reactions.removeAll()
                    }
                )
            })
    }
module.exports.allowedInGeneral = true