const Discord = require('discord.js')
const utl = require('../utility')
module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .addRole <role> <positon> <price>
    */
    async (args, msg, client) => {
        if(msg.member.roles.cache.find(r => r.permissions.has('ADMINISTRATOR'))) {
            var mRole = msg.mentions.roles.first()
            if(!mRole) {
                utl.embed.ping(msg, 'не указана роль!')
                return
            }

            var pos = Number(args[2])
            if(!pos || !Number.isInteger(pos)) {
                utl.embed.ping(msg, 'не указана позиция роли!')
                return
            }
            if(pos == 0 || pos > 18) {
                utl.embed.ping(msg, 'позиция роли ограничена диапозоном 1-18!')
                return
            }

            var price = Number(args[3])
            if(!price || !Number.isInteger(price)) {
                utl.embed.ping(msg, 'не указана цена роли!')
                return
            }

            var server = await new utl.db.DBServer(msg.guild)
            if(!server.roles)
                server.roles = [{ id: mRole.id, price: price }]
            else
                server.roles.splice(pos - 1, 0, { id: mRole.id, price: price })
            server.save()

        }
    }