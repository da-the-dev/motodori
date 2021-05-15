const Discord = require('discord.js')
const { dot } = require('../constants.json').emojies
const utl = require('../utility')

module.exports =
    /**
     * Standard embed reply
     * @param {Discord.Message} msg - Disord message
     * @param {string} title - Message title
     * @param {string} message - Text message to send
     * @returns {Promise<Discord.Message>}
     */
    (msg, title, message = '') => {
        return msg.channel.send(new Discord.MessageEmbed()
            .setTitle(`${dot}${title}`)
            .setDescription(message)
            .setThumbnail(msg.author.displayAvatarURL({ dynamic: true }))
            .setColor('#2F3136')
        )
    }

module.exports.ping =
    /**
     * Standard embed reply plus member ping
     * @param {Discord.Message} msg - Disord message
     * @param {string} title - Message title
     * @param {string} message - Text message to send
     * @returns {Promise<Discord.Message>}
     */
    (msg, title, message = '') => {
        return msg.channel.send(new Discord.MessageEmbed()
            .setTitle(`${dot}${title}`)
            .setDescription(`<@${msg.author.id}>, ${message}`)
            .setThumbnail(msg.author.displayAvatarURL({ dynamic: true }))
            .setColor('#2F3136')
        )
    }

/**
 * Calculate time when the message was sent
 * @param {(Discord.Message|Discord.GuildMember|number)} source
 */
module.exports.calculateTime = (source) => {
    var time = 'Сегодня, в '
    var date
    if(typeof source == 'number')
        date = new Date(new Date(source).toLocaleString("en-US", { timeZone: "Europe/Moscow" }))
    else if(source instanceof Discord.Message)
        date = new Date(new Date(source.createdTimestamp).toLocaleString("en-US", { timeZone: "Europe/Moscow" }))
    else if(source instanceof Discord.GuildMember)
        date = new Date(new Date(source.joinedTimestamp).toLocaleString("en-US", { timeZone: "Europe/Moscow" }))

    var hours = date.getHours().toString().padStart(2, '0')
    var minutes = date.getMinutes().toString().padStart(2, '0')
    time += `${hours}:${minutes}`
    return time
}

/**
 * Return MessageEmbeded embed reply
 * @param {Discord.Message} msg - Disord message
 * @param {string} title - Message title
 * @param {string} message - Text message to send
 */
module.exports.build = (msg, title, message = '') => {
    return new Discord.MessageEmbed()
        .setTitle(`${dot}${title}`)
        .setDescription(message)
        .setThumbnail(msg.author.displayAvatarURL({ dynamic: true }))
        .setColor('#2F3136')

}

module.exports.def = (msg, value) => {
    var message = new Discord.MessageEmbed()
        .setColor('#FF0000')
        .setFooter(`${msg.author.tag} • ${module.exports.calculateTime(msg)} `, msg.author.avatarURL())
    if(value)
        message.setDescription(`Антикраш защита **включена**!`)
    else
        message.setDescription(`Антикраш защита **выключена**!`)

    return message
}
module.exports.sus = (client, reason) => {
    return new Discord.MessageEmbed()
        .setColor('#2F3136')
        .setTitle(`${dot}Подозрительная деятельность`)
        .setDescription(`С Вас были сняты все роли с правами администратора за подозрительную деятельность: **${reason}**`)
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
}