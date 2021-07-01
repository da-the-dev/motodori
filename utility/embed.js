const Discord = require('discord.js')

module.exports =
    /**
     * Standard embed reply
     *
     * @param {Discord.Message} msg - Disord message
     * @param {string} title - Message title
     * @param {string} message - Text message to send
     * @returns {Promise<Discord.Message>}
     */
    (msg, title, message = '') => {
        return msg.channel.send(new Discord.MessageEmbed()
            .setTitle(`${title}`)
            .setDescription(message)
            .setThumbnail(msg.author.displayAvatarURL({ dynamic: true }))
            .setColor('#2F3136')
        )
    }

module.exports.ping =
    /**
     * Standard embed reply plus member ping
     *
     * @param {Discord.Message} msg - Disord message
     * @param {string} title - Message title
     * @param {string} message - Text message to send
     * @returns {Promise<Discord.Message>}
     */
    (msg, title, message = '') => {
        return msg.channel.send(new Discord.MessageEmbed()
            .setTitle(`${title}`)
            .setDescription(`<@${msg.author.id}>, ${message}`)
            .setThumbnail(msg.author.displayAvatarURL({ dynamic: true }))
            .setColor('#2F3136')
        )
    }

/**
 * Calculate time when the message was sent
 *
 * @param {(Discord.Message|Discord.GuildMember|number)} source
 * @returns
 */
module.exports.calculateTime = (source) => {
    let time = 'Сегодня, в '
    let date
    if(typeof source == 'number')
        date = new Date(new Date(source).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' }))
    else if(source instanceof Discord.Message)
        date = new Date(new Date(source.createdTimestamp).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' }))
    else if(source instanceof Discord.GuildMember)
        date = new Date(new Date(source.joinedTimestamp).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' }))

    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    time += `${hours}:${minutes}`
    return time
}

/**
 * Return MessageEmbeded embed reply
 *
 * @param {Discord.Message} msg - Disord message
 * @param {string} title - Message title
 * @param {string} message - Text message to send
 * @returns
 */
module.exports.build = (msg, title, message = '') => {
    return new Discord.MessageEmbed()
        .setTitle(`${title}`)
        .setDescription(message)
        .setThumbnail(msg.author.displayAvatarURL({ dynamic: true }))
        .setColor('#2F3136')

}

module.exports.def = (msg, value) => {
    const message = new Discord.MessageEmbed()
        .setColor('#FF0000')
        .setFooter(`${msg.author.tag} • ${new Date(msg.createdTimestamp).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })} `, msg.author.avatarURL())
    if(value)
        message.setDescription(`Антикраш защита **включена**!`)
    else
        message.setDescription(`Антикраш защита **выключена**!`)

    return message
}
module.exports.sus = (client, reason) => {
    return new Discord.MessageEmbed()
        .setColor('#2F3136')
        .setTitle(`Подозрительная деятельность`)
        .setDescription(`С Вас были сняты все роли с правами администратора за подозрительную деятельность: **${reason}**`)
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
}