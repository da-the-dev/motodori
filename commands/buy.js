const Discord = require('discord.js')
const utl = require('../utility')
const { DBServer, DBUser } = utl.db
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

        const server = await new DBServer(msg.guild.id)
        server.close()

        var selectedRole = server.roles[args[1] - 1]
        var user = await new DBUser()

        if(user) {
            if(!user.money) {
                utl.embed.ping(msg, sMsg, `не достаточно <${sweet}> для покупки роли!`)
                db.close()
                return
            }
            if(user.money < selectedRole.price) {
                utl.embed.ping(msg, sMsg, `не достаточно <${sweet}> для покупки роли!`)
                db.close()
                return
            }
            utl.embed.ping(msg, sMsg, `Вы уверены, что хотите купить роль <@&${selectedRole.id}>?`)
                .then(m => {
                    utl.reactionSelector.yesNo(m, msg.author.id,
                        () => {
                            user.money -= selectedRole.price
                            if(!user.inv)
                                user.inv = []
                            user.inv.push(selectedRole.id)
                            user.save()

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
    }