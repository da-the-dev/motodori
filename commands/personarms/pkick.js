const { Message, Client } = require('discord.js')
const { embed, db } = require('../../utility')
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
        const personaRoom = server.personalRooms.find(p => p.creator == msg.author.id)
        if(!personaRoom) {
            embed.ping(msg, sMsg, 'на Ваше имя не зарегистрирована личная комната!')
            return
        }

        const mMember = msg.mentions.members.first()
        if(!mMember) {
            embed.ping(msg, sMsg, 'не указан участник!')
            return
        }

        const room = msg.guild.channels.cache.get(personaRoom.id)
        room.updateOverwrite(mMember.id, { 'CONNECT': null })

        if(mMember.voice.channelID == personaRoom.id)
            mMember.voice.setChannel(null)

        embed.ping(msg, sMsg, `Вы успешно закрыли доступ ${mMember.user} в свою личную комнату!`)
    }
module.exports.allowedInGeneral = true