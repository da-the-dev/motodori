const Discord = require('discord.js')
const constants = require('../constants.json')
/**
 * @param {Discord.Client} client  
 */
module.exports.initLogs = client => {
    client.on('messageUpdate', (oldMsg, newMsg) => {
        msgLog('update', newMsg.editedTimestamp, oldMsg, newMsg)
    })
    client.on('messageDelete', msg => {
        // console.log(msg)
        msgLog('delete', msg.createdTimestamp, msg)
    })
}

/**
 * Logs moderator actions
 * @param {Discord.Message} msg - OG message 
 * @param {('mute'|'unmute'|'ban'|'unban'|'toxic'|'untoxic'|'warn'|'unwarn')} action - Type of action
 * @param {Discord.GuildMember} who - Who
 * @param {Discord.GuildMember} acused - Acused
 * @param {number} when - When 
 * @param {string} why - Reason
 * @param {number} duration - Duration in seconds
 */
module.exports.modLog = (guild, action, who, acused, when, why = null, duration = null) => {
    const date = new Date(when).toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })

    const embed = new Discord.MessageEmbed()
        .setFooter(`${date}`)

    switch(action) {
        case 'ban':
            embed.setTitle('Локальная блокировка')
                .setDescription(`<@${who.id}> **забанил** <@${acused.id}>`)
                .setColor('#4d4d4d')
            break
        case 'unban':
            embed.setTitle('Локальная блокировка')
                .setDescription(`<@${who.id}> **разбанил** <@${acused.id}>`)
                .setColor('#4d4d4d')
            break

        case 'mute':
            embed.setTitle('Мут')
                .setDescription(`<@${who.id}> **замутил** <@${acused.id}> на ${timeCalculator(duration)}\nПричина: ${why}`)
                .setColor('#34CCEB')
            break
        case 'unmute':
            embed.setTitle('Мут')
                .setDescription(`<@${who.id}> **размутил** <@${acused.id}>}`)
                .setColor('#34CCEB')
            break

        case 'toxic':
            embed.setTitle('Токсик')
                .setDescription(`<@${who.id}> **выдал** *токсика* <@${acused.id}>}`)
                .setColor('#4aff68')
            break
        case 'untoxic':
            embed.setTitle('Токсик')
                .setDescription(`<@${who.id}> **забрал** *токсика* у <@${acused.id}>}`)
                .setColor('#4aff68')
            break

        case 'warn':
            embed.setTitle('Варн')
                .setDescription(`<@${who.id}> **выдал** *варн* <@${acused.id}>`)
                .addField('Содержание варна:', `\`\`\`${why}\`\`\``)
                .setColor('#ff8308')
            break
        case 'unwarn':
            embed.setTitle('Варн')
                .setDescription(`<@${who.id}> **снял** *варн* с <@${acused.id}>`)
                .addField('Содержание варна:', `\`\`\`${why}\`\`\``)
                .setColor('#ff8308')
            break
    }
    guild.channels.cache.get(constants.channels.log).send(embed)
}

/**
 * 
 * @param {'delete'|'update'} what 
 * @param {number} when 
 * @param {Discord.Message} msg
 * @param {Discord.Message} [msg2]
 */
async function msgLog(what, when, msg, msg2) {
    const date = new Date(when).toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })
    const embed = new Discord.MessageEmbed()
        .setFooter(`${date}`)

    msg.partial ? await msg.fetch() : null
    msg2.partial ? await msg2.fetch() : null

    switch(what) {
        case 'delete':
            if((msg.content && msg.content.startsWith('.')) || msg.author.id == msg.client.user.id)
                return
            embed.setTitle('Удаление сообщения')
                .setDescription(`Удалено сообщение в ${msg.channel}`)
                .addField('Содержание сообщения:', `*${msg.content}*`)
                .addField('Автор сообщения:', `${msg.author}`)
                .setColor('#08fff7')
            break
        case 'update':
            if(msg.content == msg2.content)
                return
            if(msg.author.id == msg.client.user.id)
                return
            embed.setTitle('Изменение сообщения')
                .setDescription(`Изменено сообщение в ${msg.channel}\n[Ссылка на него](${msg2.url})`)
                .addField('Было:', `*${msg.content}*`, true)
                .addField('Стало:', `*${msg2.content}*`, true)
                .addField('Автор сообщения:', `${msg2.author}`)
                .setColor('#00948f')
        // .setColor('#00948f')
    }
    msg.guild.channels.cache.get(constants.channels.log).send(embed)
}
