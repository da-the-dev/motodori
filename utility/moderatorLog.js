const Discord = require('discord.js')
const utl = require('../utility')
const constants = require('../constants.json')

/**
 * 
 * @param {number} time - Time in seconds
 * @returns 
 */
function timeCalculator(time) {
    var mmD = Math.floor(time / 60 / 60 / 24)
    var mmH = Math.floor(time / 60 / 60) - (mmD * 24)
    var mmM = Math.floor(time / 60) - (mmD * 60 * 24 + mmH * 60)
    var mmS = Math.floor(time - (mmD * 60 * 60 * 24 + mmH * 60 * 60 + mmM * 60))
    var msg = ''

    if(mmD) msg += '**' + mmD.toString() + '**' + "d "
    if(mmH) msg += '**' + mmH.toString() + '**' + "h "
    if(mmM) msg += '**' + mmM.toString() + '**' + "m "
    if(mmS) msg += '**' + mmS.toString() + '**' + "s "

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

    const date = new Date(new Date(when).toLocaleString("en-US", { timeZone: "Europe/Moscow" }))

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
    }
    msg.guild.channels.cache.get(constants.channels.log).send(embed)
}