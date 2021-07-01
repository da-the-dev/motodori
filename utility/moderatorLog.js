const Discord = require('discord.js')
const constants = require('../constants.json')

/**
 * 
 * @param {number} time - Time in seconds
 * @returns 
 */
function timeCalculator(time) {
    const mmD = Math.floor(time / 60 / 60 / 24)
    const mmH = Math.floor(time / 60 / 60) - (mmD * 24)
    const mmM = Math.floor(time / 60) - (mmD * 60 * 24 + mmH * 60)
    const mmS = Math.floor(time - (mmD * 60 * 60 * 24 + mmH * 60 * 60 + mmM * 60))
    let msg = ''

    if(mmD) msg += '**' + mmD.toString() + '**' + 'd '
    if(mmH) msg += '**' + mmH.toString() + '**' + 'h '
    if(mmM) msg += '**' + mmM.toString() + '**' + 'm '
    if(mmS) msg += '**' + mmS.toString() + '**' + 's '

    return msg
}

/**
 *
 * @param {Discord.Message} msg - OG message 
 * @param {('mute'|'unmute'|'ban'|'unban'|'toxic'|'untoxic'|'warn'|'unwarn')} action - Type of action
 * @param {Discord.GuildMember} who - Who
 * @param {Discord.GuildMember} acused - Acused
 * @param {number} when - When 
 * @param {string} why - Reason
 * @param {number} duration - Duration in seconds
 */
module.exports.log = (msg, action, who, acused, when, why = null, duration = null) => {
    const embed = new Discord.MessageEmbed()
    embed.setColor('#34cceb')

    const date = new Date(new Date(when).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' }))

    switch(action) {
        case 'ban':
            embed.setTitle('Локальная блокировка')
            embed.setDescription(`<@${who.id}> забанил <@${acused.id}>\n${date.toLocaleString()}`)
            break
        case 'unban':
            embed.setTitle('Локальная блокировка')
            embed.setDescription(`<@${who.id}> разбанил <@${acused.id}>\n${date.toLocaleString()}`)
            break
        case 'mute':
            embed.setTitle('Мут')
            embed.setDescription(`<@${who.id}> замутил <@${acused.id}> на ${timeCalculator(duration)}\nПричина: ${why}\n${date.toLocaleString()}`)
            break
        case 'unmute':
            embed.setTitle('Мут')
            embed.setDescription(`<@${who.id}> размутил <@${acused.id}>\n${date.toLocaleString()}`)
            break
        case 'toxic':
            embed.setTitle('Токсик')
            embed.setDescription(`<@${who.id}> выдал токсика <@${acused.id}>\n${date.toLocaleString()}`)
            break
        case 'untoxic':
            embed.setTitle('Токсик')
            embed.setDescription(`<@${who.id}> забрал токсика у <@${acused.id}>\n${date.toLocaleString()}`)
            break
        case 'warn':
            embed.setTitle('Варн')
            embed.setDescription(`<@${who.id}> выдал варн <@${acused.id}>\nСодержание варна: ${why}\n${date.toLocaleString()}`)
            break
        case 'unwarn':
            embed.setTitle('Варн')
            embed.setDescription(`<@${who.id}> снял варн с <@${acused.id}>\nСодержание варна: ${why}\n${date.toLocaleString()}`)
            break

    }
    msg.guild.channels.cache.get(constants.channels.log).send(embed)
}