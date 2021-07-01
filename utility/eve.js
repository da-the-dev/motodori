const Discord = require('discord.js')
const utl = require('../utility')
const constants = require('../constants.json')
const { getConnection } = utl.db
/**
 * 
 * @param {Discord.Guild} guild 
 */
module.exports.sendMessage = async guild => {
    const msgID = (await getConnection().get(guild.id, 'eventerMsgID')).msgID
    /**@type {Discord.TextChannel} */
    const channel = guild.channels.cache.get('842098512896065577')
    channel.messages.fetch(msgID).catch(err => {
        if(err)
            channel.send(`<@&${constants.roles.eventee}> - выдается людям, которые хотят участвовать в ивентах проходящих на сервере, чтобы её получить прожми реакцию снизу`).then(m => {
                m.react('a:flow_m:843253792844677120')
                getConnection().set(guild.id, 'eventerMsgID', { msgID: m.id })
            })
    })
}

/**
 * 
 * @param {Discord.MessageReaction} reaction 
 * @param {Discord.User} user 
 */
module.exports.reaction = async (reaction, user) => {
    const msgID = (await getConnection().get(reaction.message.guild.id, 'eventerMsgID')).msgID
    if(reaction.message.id == msgID && user.id != reaction.client.user.id)
        reaction.message.guild.member(user).roles.add(constants.roles.eventee)
}