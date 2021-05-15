const Discord = require('discord.js')
const utl = require('../utility')
const { sweet } = require('../constants.json').emojies
const sMsg = 'Покупка роли'

module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .buy <pos>
    */
    (args, msg, client) => {
        if(!args[1]) {
            utl.embed.ping(msg, sMsg, 'Не указан номер роли для покупки!')
            return
        }

        utl.db.createClient(process.env.MURL).then(async db => {
            var serverData = await db.get(msg.guild.id, 'serverSettings')
            if(serverData) {
                var selectedRole = serverData.roles[args[1] - 1]
                var userData = await db.get(msg.guild.id, msg.author.id)
                if(userData) {
                    if(!userData.money) {
                        utl.embed.ping(msg, sMsg, `Не достаточно <${sweet}> для покупки роли!`)
                        db.close()
                        return
                    }
                    if(userData.money < selectedRole.price) {
                        utl.embed.ping(msg, sMsg, `Не достаточно <${sweet}> для покупки роли!`)
                        db.close()
                        return
                    }
                    utl.embed.ping(msg, sMsg, `Вы уверены, что хотите купить роль <@&${selectedRole.id}>?`)
                        .then(m => {
                            utl.reactionSelector.yesNo(m, msg.author.id,
                                () => {
                                    userData.money -= selectedRole.price
                                    if(!userData.inv)
                                        userData.inv = []
                                    userData.inv.push(selectedRole.id)
                                    db.set(msg.guild.id, msg.author.id, userData).then(() => db.close())

                                    m.edit(utl.embed.build(msg, sMsg, `Вы успешно приобрели роль <@&${selectedRole.id}>`))
                                    m.reactions.removeAll()
                                    return
                                },
                                () => {
                                    m.edit(utl.embed.build(msg, sMsg, 'Покупка отменена'))
                                    m.reactions.removeAll()
                                },
                                () => {
                                    m.edit(utl.embed.build(msg, sMsg, 'Покупка отменена про причине истечения времени'))
                                    m.reactions.removeAll()
                                }
                            )
                        })
                } else {
                    utl.embed.ping(msg, sMsg, 'не достаточно средств для покупки роли!')
                    db.close()
                    return
                }
            } else {
                utl.embed.ping(msg, sMsg, 'нет ролей для покупки!')
                db.close()
            }
        })
    }