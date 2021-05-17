const Discord = require('discord.js')
const utl = require('../utility')
const { DBServer, DBUser, Connection } = utl.db
const { sweet } = require('../constants.json').emojies
const sMsg = 'Покупка роли'

module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .buy <pos>
    */
    async (args, msg, client) => {
        if(!args[1]) {
            utl.embed.ping(msg, sMsg, 'не указан номер роли!')
            return
        }
        if(Number.isInteger(Number(args[1]))) {
            utl.embed.ping(msg, sMsg, 'указан неверный номер роли!')
            return
        }

        const con = await new Connection()
        const server = await new DBServer(msg.guild.id, con)

        if(!server.roles) {
            utl.embed.ping(msg, sMsg, 'на этом сервере пока нет ролей для покупки ;(')
            con.close()
            return
        }

        const selectedRole = server.roles[args[1] - 1]
        const user = await new DBUser(msg.guild.id, msg.author.id, con)

        if(!user.money) {
            utl.embed.ping(msg, sMsg, `Не достаточно <${sweet}> для покупки роли!`)
            con.close()
            return
        }
        if(user.money < selectedRole.price) {
            utl.embed.ping(msg, sMsg, `Не достаточно <${sweet}> для покупки роли!`)
            con.close()
            return
        }

        const m = await utl.embed.ping(msg, sMsg, `Вы уверены, что хотите купить роль <@&${selectedRole.id}>?`)
        utl.reactionSelector.yesNo(m, msg.author.id,
            () => {
                user.money -= selectedRole.price
                if(!user.inv)
                    user.inv = []
                user.inv.push(selectedRole.id)
                user.save()
                con.close()

                m.edit(utl.embed.ping(msg, sMsg, `Вы успешно приобрели роль <@&${selectedRole.id}>`))
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
    }