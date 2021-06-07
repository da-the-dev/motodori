const { Message, MessageEmbed, Client } = require('discord.js')
const { embed, db, reactionSelector } = require('../../utility')
const { DBServer, DBUser } = db
const sMsg = 'Выкуп личной комнаты'

module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Message} msg Discord message object
    * @param {Client} client Discord client object
    * Usage: .ppay
    */
    async (args, msg, client) => {
        const server = await new DBServer(msg.guild.id)
        const personaRoom = server.personaRooms.find(p => p.creator == msg.author.id)
        if(!personaRoom) {
            embed.ping(msg, sMsg, 'на Ваше имя не зарегистрирована личная комната!')
            return
        }

        const user = await new DBUser(msg.guild.id, msg.author.id)
        const ransom = (21 * 60 - personaRoom.activity * 60) / 60
        if(user.money < ransom * 100) {
            embed.ping(msg, sMsg, 'у Вас не достаточно средств для выкупа приватной комнаты!')
            return
        }

        user.money -= ransom * 100
        server.personaRooms[server.personaRooms.indexOf(personaRoom)].activity += ransom
        user.save()
        server.save()

        embed.ping(msg, sMsg, 'комната успешно выкуплена!')
    }
module.exports.allowedInGeneral = true