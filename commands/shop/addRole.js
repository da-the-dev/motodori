const Discord = require('discord.js')
const utl = require('../../utility')
const { DBServer } = utl.db
const sMsg = 'Добавление роли в магазин'
module.exports =
    /**
     * @param {Array<string>} args Command argument
     * @param {Discord.Message} msg Discord message object
     * @param {Discord.Client} client Discord client object
     * @example Usage: .addRole <role> <positon> <price>
     */
    async (args, msg, client) => {
        if(msg.member.roles.cache.find(r => r.permissions.has('ADMINISTRATOR'))) {
            const mRole = msg.mentions.roles.first()
            if(!mRole) {
                utl.embed.ping(msg, sMsg, 'не указана роль!')
                return
            }

            const pos = Number(args[2])
            if(!pos || !Number.isInteger(pos)) {
                utl.embed.ping(msg, sMsg, 'не указана позиция роли!')
                return
            }
            if(pos == 0 || pos > 20) {
                utl.embed.ping(msg, sMsg, 'позиция роли ограничена диапозоном 1-20!')
                return
            }

            const price = Number(args[3])
            if(!price || !Number.isInteger(price)) {
                utl.embed.ping(msg, sMsg, 'не указана цена роли!')
                return
            }

            const server = await new DBServer(msg.guild.id)
            console.log(server.roles)
            if(!server.roles)
                server.roles = [{ id: mRole.id, price: price }]
            else
                server.roles.splice(pos - 1, 0, { id: mRole.id, price: price })

            console.log(server.roles)
            server.save()
        }
    }