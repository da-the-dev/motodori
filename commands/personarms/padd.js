const { Message, MessageEmbed, Client } = require('discord.js')
const { embed, db, reactionSelector } = require('../../utility')
const { DBServer } = db
const sMsg = 'Личная комната'

module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Message} msg Discord message object
    * @param {Client} client Discord client object
    * Usage: .padd name  
    */
    async (args, msg, client) => {
        const server = await new DBServer(msg.guild.id)
        const personaRoom = server.personaRooms.find(p => p.creator == msg.author.id)
        if(!personaRoom) {
            embed.ping(msg, sMsg, 'на Ваше не зарегистрирована личная комната!')
            return
        }

        const mMember = msg.mentions.members.first()
        if(!mMember) {
            embed.ping(msg, sMsg, 'не указан участник!')
            return
        }

        const room = msg.guild.channels.cache.get(personaRoom.id)
        room.updateOverwrite(mMember.id, { "CONNECT": true })

        embed.ping(msg, sMsg, `Вы успешно добавили ${mMember.user} в свою личную комнату!`)
    }
module.exports.allowedInGeneral = true