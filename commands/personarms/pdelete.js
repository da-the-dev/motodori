const { Message, Client } = require('discord.js')
const { embed, db, reactionSelector } = require('../../utility')
const { DBServer } = db
const sMsg = 'Удаление личной комнаты'

module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Message} msg Discord message object
    * @param {Client} client Discord client object
    * Usage: .pdelete
    */
    async (args, msg, client) => {
        const server = await new DBServer(msg.guild.id)
        const personaRoom = server.personaRooms.find(p => p.creator == msg.author.id)
        if(!personaRoom) {
            embed.ping(msg, sMsg, 'на Ваше имя не зарегистрирована личная комната!')
            return
        }

        const m = await embed.ping(msg, sMsg, 'Вы уверены, что хотите удалить личную комнату?')
        reactionSelector.yesNo(m, msg.author.id,
            () => {
                msg.guild.channels.cache.get(personaRoom.id).delete()
                server.personaRooms.splice(server.personaRooms.indexOf(personaRoom), 1)
                server.save()

                embed(msg, sMsg, 'Личная комната успешно удалена!')
                m.delete()
            },
            () => {
                m.delete()
            },
            () => {
                m.delete()
            }
        )
    }
module.exports.allowedInGeneral = true