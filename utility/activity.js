const Discord = require('discord.js')
var voiceActs = []
const utl = require('../utility')
const { getConnection } = require('../utility/db')

/**
 * Increments money and time fields for all current active members every minute
 */
const voiceAct = () => {
    setInterval(() => {
        var prepedVoiceActs = voiceActs.map(a => { return { id: a } })
        if(prepedVoiceActs.length > 0) {
            var update = { $inc: { money: 1, voiceTime: 1 } }
            getConnection().updateMany('836297404260155432', { $or: prepedVoiceActs }, update)
        }
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
    voiceAct()
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
var messagesCounter = 1
const amountOfMessages = 10
/**
 * Give user 1 point every 5 messages, save the message in
 * DB as regular, day and night message accordingly
 * @param {Discord.Message} msg - Message
 */
module.exports.chatActivity = async (msg) => {
    // // Register only if in general and not a bot
    // if(msg.channel.id == constants.channels.general && !msg.author.bot) {
    //     // Save it in the map
    //     messages.set(msg.author.id, messages.get() || 1)

    //     // Check if enough messages have been collected
    //     if(messagesCounter < amountOfMessages) {
    //         messagesCounter++
    //     }
    //     else {
    //         utl.db.createClient(process.env.MURL).then(async db => {
    //             var arrayMap = Array.from(messages.entries())
    //             for(i = 0; i < arrayMap.length; i++) {
    //                 // Form update query based on message info
    //                 var update = { $inc: {} }
    //                 arrayMap[i][1].forEach(mI => {
    //                     update.$inc.msgs ? update.$inc.msgs++ : update.$inc.msgs = 1
    //                 })

    //                 // Update member
    //                 await db.update('836297404260155432', arrayMap[i][0], update)
    //             }
    //             // Reset map and counter
    //             messages.clear()
    //             messagesCounter = 1

    //             // Give out activity roles to those who want them
    //             db.getMany('836297404260155432', {
    //                 $or: [
    //                     { dayMsgs: { $exists: true } },
    //                     { nightMsgs: { $exists: true } }
    //                 ]
    //             }).then(validData => {
    //                 validData.forEach(d => {
    //                     if(!d.notActivity) {
    //                         // var member = msg.guild.member(d.id)
    //                         // if(member) {
    //                         //     if(d.dayMsgs >= 500 && !member.roles.cache.has(constants.roles.daylyActive))
    //                         //         null
    //                         //     // member.roles.add(constants.roles.daylyActive)
    //                         //     else if(d.nightMsgs >= 500 && !member.roles.cache.has(constants.roles.nightActive))
    //                         //         member.roles.add(constants.roles.nightActive)
    //                         // }
    //                     }
    //                 })
    //                 db.close()
    //             })
    //         })
    //     }
    // }
}