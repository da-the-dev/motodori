const Discord = require('discord.js')
var voiceActs = []
const utl = require('../utility')
const constants = require('../constants.json')
const { getConnection, getGuild } = require('../utility/db')

/**
 * Increments money and time fields for all current active members every minute
 * @param {Discord.Client} client
 */
const voiceAct = client => {
    setInterval(async () => {
        var prepedVoiceActs = voiceActs.map(a => { return { id: a } })
        if(prepedVoiceActs.length > 0) {
            var update = { $inc: { money: 1, voiceTime: 1 } }
            getConnection().updateMany('836297404260155432', { $or: prepedVoiceActs }, update)
        }

        getGuild('836297404260155432').then(guild => {
            guild.forEach(m => {
                /**@type {Discord.GuildMember} */
                const member = client.guild.member(m.id)
                if(!member) return

                // console.log(m.id, 'uact:', m.uact, '|', m.msgs >= 1000, m.voiceTime >= 6000, m.uact == false, !member.roles.cache.has(constants.roles.active))

                if((m.msgs >= 1000 || m.voiceTime >= 6000) && m.uact == false && !member.roles.cache.has(constants.roles.active)) {
                    member.roles.add(constants.roles.active)
                }
            })
        })
    }, 60000)
}

/**
 * @desctiption Give user points every 1 minute in voicechat
 * @param {Discord.VoiceState} oldState
 * @param {Discord.VoiceState} newState
 */
module.exports.voiceActivity = (oldState, newState) => {
    // console.log(newState.channelID == oldState.channelID)
    if(newState.channelID == oldState.channelID)
        return

    // User joined a voicechannel
    if(newState.channel) {
        console.log(`[MG] '${newState.member.user.username}' joined`)

        if(newState.channel.members.size == 2) {
            newState.channel.members.forEach(m => {
                voiceActs.push(m.id)
            })
        } else if(newState.channel.members.size > 2)
            voiceActs.push(newState.member.id)

    } else if(newState.channel === null) { // User left a voicechannel
        console.log(`[MG] '${newState.member.user.username}' left`)
        voiceActs.splice(voiceActs.indexOf(newState.member.id), 1)
        if(oldState.channel)
            if(oldState.channel.members.size == 1)
                voiceActs.splice(voiceActs.indexOf(oldState.channel.members.first().id), 1)
    }
}

/**
 * Give voice activity money when the bot restarts
 * @param {Discord.Client} client
 */
module.exports.voiceActivityInit = async (client) => {
    client.guild.channels.cache.filter(c => c.type == 'voice').forEach(v => {
        if(v.members.array().length > 1) {
            v.members.forEach(m => {
                voiceActs.push(m.id)
            })
        }
    })
    voiceAct(client)
}

/**
 * @typedef MessageInfo
 * @property {boolean} dayTime - If the message was sent during daytime (9-16)
 * @property {boolean} nightTime - If the message was sent during nightime (0-6)
 */
/**
 * This map holds an array of MessageInfo for each user who sent
 * a message in a guild
 * @type {Map<string, Array<MessageInfo>}
 */
var messages = new Map()
var messagesCounter = 0
const amountOfMessages = 10
/**
 * Give user 1 point every 5 messages, save the message in
 * DB as regular, day and night message accordingly
 * @param {Discord.Message} msg - Message
 */
module.exports.chatActivity = async (msg) => {
    // Register only if in general and not a bot
    if(msg.channel.id == constants.channels.general && !msg.author.bot) {
        getConnection().update('836297404260155432', msg.author.id, { $inc: { msgs: 1 } })
        messages.set(msg.author.id, messages.get(msg.author.id) + 1 || 1)

        const entrified = Array.from(messages.entries())
        for(i = 0; i < messages.size; i++)
            if(entrified[i][1] == 5) {
                messages.delete(entrified[i][0])
                getConnection().update('836297404260155432', msg.author.id, { $inc: { money: 1 } })
            }
    }
}