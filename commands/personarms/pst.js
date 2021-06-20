const { Message, MessageEmbed, Client } = require('discord.js')
const { embed, db, reactionSelector, time } = require('../../utility')
const { DBServer } = db
const constants = require('../../constants.json')
const sMsg = 'Статистика личной комнаты'

module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Message} msg Discord message object
    * @param {Client} client Discord client object
    * Usage: .pcreate name  
    */
    async (args, msg, client) => {
        const name = args[1]
        if(!name) {
            embed.ping(msg, sMsg, 'Вы не указали команату!')
            return
        }
        const server = await new DBServer(msg.guild.id)
        const personaRoom = server.personalRooms.find(r => r.name == name)
        if(!personaRoom) {
            embed.ping(msg, sMsg, 'Эта комната не является личной или её не существует!')
            return
        }
        const discordPRm = msg.guild.channels.cache.get(personaRoom.id)

        console.log(discordPRm.permissionOverwrites.filter(p => p.id != msg.guild.id).size)
        msg.channel.send(embed.build(msg, sMsg,
            `
            Личная комната: <#${personaRoom.id}>
            Владелец: <@${personaRoom.creator}>
            Участников: **${discordPRm.permissionOverwrites.filter(p => p.id != msg.guild.id).size}**
            ID комнаты: **${personaRoom.id}**\n
            Создана: ${new Date(personaRoom.createdTimestamp).toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })}
            Одобрена: <@${personaRoom.approver}>
            Активность: ${time.timeCalculator(personaRoom.activity) || '**0** мин'}
            `
        ))
    }
module.exports.allowedInGeneral = true