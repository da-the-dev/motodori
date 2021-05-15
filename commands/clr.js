const Discord = require('discord.js')
const utl = require('../utility')
const constants = require('../constants.json')
const { sweet } = constants.emojies
const { DBUser, DB } = utl.db
const sMsg = 'Любовная комната'
const ssMsg = 'Создание любовной комнаты'
module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .clr <member>
    */
    async (args, msg, client) => {
        var mMember = msg.mentions.members.first()
        if(!mMember) {
            utl.embed(msg, sMsg, 'Не указан участник!')
            return
        }
        if(mMember.id == msg.member.id) {
            utl.embed(msg, sMsg, 'Неверный участник!')
            return
        }

        var user = await new DBUser(msg.guild.id, msg.author.id)
        if(user) {
            if(!user.money || user.money < 10000) {
                utl.embed(msg, sMsg, `У Вас недостачно ${sweet} для покупки любовной комнаты!`)
                DB.saveAll()
                return
            }
            if(user.loveroom) {
                utl.embed(msg, sMsg, 'У Вас уже есть любовная комната!')
                DB.saveAll()
                return
            }

            var partner = await new DBUser(msg.guild.id, msg.author.id)
            if(partner) {
                if(partner.loveroom) {
                    utl.embed(msg, sMsg, 'У партнера уже есть любовная комната!')
                    DB.saveAll()
                    return
                }
            }

            const m = await utl.embed(msg, ssMsg, `<@${mMember.id}>, <@${msg.member.id}> хочет создать с тобой любовную комнату, что ответишь?\nСтоимость комнаты **10.000** ${sweet}`)

            utl.reactionSelector.yesNo(m, mMember.id,
                async () => {
                    const c = await m.guild.channels.create(`${msg.author.username} ❤ ${mMember.user.username}`, {
                        type: 'voice',
                        permissionOverwrites:
                            [
                                {
                                    id: msg.guild.id,
                                    deny: ["CONNECT"]
                                },
                                {
                                    id: constants.roles.verify,
                                    deny: ["VIEW_CHANNEL", "CONNECT"]
                                },
                                {
                                    id: constants.roles.muted,
                                    deny: ["VIEW_CHANNEL", "CONNECT"]
                                },
                                {
                                    id: constants.roles.toxic,
                                    deny: ["VIEW_CHANNEL", "CONNECT"]
                                },
                                {
                                    id: constants.roles.localban,
                                    deny: ["VIEW_CHANNEL", "CONNECT"]
                                },
                                {
                                    id: msg.author.id,
                                    allow: ["VIEW_CHANNEL", 'CONNECT']
                                },
                                {
                                    id: mMember.id,
                                    allow: ["VIEW_CHANNEL", 'CONNECT']
                                }
                            ],
                        parent: constants.categories.loverooms,
                        userLimit: 2
                    })

                    mMember.roles.add(constants.roles.loveroom)
                    msg.member.roles.add(constants.roles.loveroom)

                    user.money -= 10000
                    const date = Date.now()
                    user.loveroom = { 'id': c.id, 'partner': mMember.id, 'creationDate': date, 'bal': 6000 }
                    partner.loveroom = { 'id': c.id, 'partner': msg.author.id, 'creationDate': date, 'bal': 6000 }
                    DB.saveAll()

                    m.edit(utl.embed.build(msg, ssMsg, `<@${msg.member.id}> и <@${mMember.id}> теперь пара!`))
                    m.reactions.removeAll()
                },
                () => {
                    m.edit(utl.embed.build(msg, sMsg, `<@${mMember.id}> тебе отказал(-а)`))
                    m.reactions.removeAll()
                    DB.saveAll()
                },
                () => {
                    m.edit(utl.embed.build(msg, sMsg, `<@${mMember.id}> тебя проигнорировал(-а)`))
                    m.reactions.removeAll()
                    DB.saveAll()
                }
            )
        } else {
            utl.embed(msg, 'У Вас недостачно конфет для покупки любовной комнаты!')
            DB.saveAll()
        }
    }
module.exports.allowedInGeneral = true