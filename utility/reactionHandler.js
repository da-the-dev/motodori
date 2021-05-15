const Discord = require('discord.js')
const utl = require('../utility')
const reactions = require('./reactions')

/**
 * @description Constructs an embed to send
 * @param {Discord.Message} msg - Message to reply to
 * @param {Array<string>} reactions - Reaction's GIF array
 * @param {string} description - Embed's description
 */
const buildMessage = (msg, reactions, description) => {
    if(!msg.deleted) msg.delete()
    var rand = Math.floor(Math.random() * reactions.length)

    return utl.embed.build(msg, `<@${msg.member.id}> ${description}`)
        .setImage(reactions[rand])
}

/**
 * Handles multiple types of reactions in one function
 * @param {Discord.GuildMember} mMember
 * @param {Function} func - Function to use to handle reaction messages
 * @param {Array} args - Build function parametrs
 */
const reactionHandle = (mMember, func, ...args) => {
    var msg = args.find(a => a.channel)
    if(mMember === null) { // Single reactions
        msg.channel.send(func(...args))
        return
    }

    var msg = args.find(a => a.channel)
    if(mMember != undefined && mMember.id != msg.author.id) { // Paired reactions
        if(func.name != 'permisson') {
            var dIndex = args.findIndex(a => typeof a == 'string')
            args[dIndex] = args[dIndex] + ` <@${mMember.id}>`
            msg.channel.send(func(...args))
            return
        }
        msg.delete()
        func(...args)
    } else {
        utl.embed(msg, 'Не лучшая идея (ノωヽ)')
        msg.delete()
    }
}

/**
 * Handles those reactions that require other member's confirmation
 * @param {Discord.Message} msg - Message
 * @param {Discord.GuildMember} member2 - Second member who reacts to the reaction
 * @param {string} description - String that describes the action in request embed 
 * @param {*} args - Build message args
 */
const permisson = (msg, member2, description, ...args) => {
    const requestEmbed = new Discord.MessageEmbed()
        .setDescription(`<@${member2.id}>, ${description} <@${msg.member.id}>, что ответишь ? `)
        .setColor('#2F3136')

    msg.channel.send(requestEmbed)
        .then(async m => {
            await m.react('✅')
            await m.react('❌')
            const filter = (reaction, user) =>
                user.id == member2.user.id
            m.awaitReactions(filter, { time: 60000, max: 1 })
                .then(reactions => {
                    if(reactions.array().length == 0) {
                        m.edit(utl.embed.build(msg, `<@${member2.id}> тебя проигнорировал(-а)`))
                        m.reactions.removeAll()
                        return
                    }
                    if(reactions.first().emoji.name == '❌') {
                        m.edit(utl.embed.build(msg, `<@${member2.id}> тебе отказал(-а)`))
                        m.reactions.removeAll()
                        return
                    }
                    if(reactions.first().emoji.name == '✅') {
                        var dIndex = args.findIndex(a => typeof a == 'string')
                        args[dIndex] = args[dIndex] + ` <@${member2.id}> `

                        m.edit(buildMessage(...[msg, ...args]))
                        m.reactions.removeAll()
                        return
                    }
                    m.reactions.removeAll()
                })
        })

}
module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Handles reaction commands
    */
    (args, msg, client) => {
        switch(args[0]) {
            // buildMessage reactions
            case 'angry':
                reactionHandle(msg.mentions.members.first(), buildMessage, msg, reactions.angry, `разозлился(-ась) на`)
                break
            case 'hit':
                reactionHandle(msg.mentions.members.first(), buildMessage, msg, reactions.hit, `ударил(-а)`)
                break
            case 'hug':
                reactionHandle(msg.mentions.members.first(), buildMessage, msg, reactions.hug, `обнял(-а)`)
                break
            case 'sad':
                reactionHandle(null, buildMessage, msg, reactions.sad, 'грустит')
                break

            case 'slap':
                reactionHandle(msg.mentions.members.first(), buildMessage, msg, reactions.slap, `ударил(-а) по лицу`)
                break
            case 'poke':
                reactionHandle(msg.mentions.members.first(), buildMessage, msg, reactions.poke, `ткнул(-а)`)
                break
            case 'pat':
                reactionHandle(msg.mentions.members.first(), buildMessage, msg, reactions.pat, `погладил(-а)`)
                break
            case 'cuddle':
                reactionHandle(msg.mentions.members.first(), buildMessage, msg, reactions.cuddle, `тискает`)
                break

            case 'bite':
                reactionHandle(msg.mentions.members.first(), buildMessage, msg, reactions.bite, `укусил(-а)`)
                break
            case 'cheek':
                reactionHandle(msg.mentions.members.first(), permisson, msg, msg.mentions.members.first(), 'тебя хочет поцеловать в щечку', reactions.cheek, `поцеловал(-а) в щеку`)
                break
            case 'cry':
                reactionHandle(null, buildMessage, msg, reactions.cry, `плачет`)
                break
            case 'happy':
                reactionHandle(null, buildMessage, msg, reactions.happy, `радуется`)
                break

            case 'lick':
                reactionHandle(msg.mentions.members.first(), buildMessage, msg, reactions.lick, `облизнул(-а)`)
                break
            case 'love':
                reactionHandle(msg.mentions.members.first(), buildMessage, msg, reactions.love, `признается в любви`)
                break
            case 'sleep':
                reactionHandle(null, buildMessage, msg, reactions.sleep, `наелся(-ась) и спит`)
                break
            case 'smoke':
                reactionHandle(null, buildMessage, msg, reactions.smoke, `курит`)
                break

            case 'tea':
                reactionHandle(null, buildMessage, msg, reactions.tea, `наслаждается чаем`)
                break
            case 'virt':
                reactionHandle(msg.mentions.members.first(), permisson, msg, msg.mentions.members.first(), 'тебе предлагает повиртить', reactions.virt, `виртит с`)
                break
            case 'kiss':
                reactionHandle(msg.mentions.members.first(), permisson, msg, msg.mentions.members.first(), 'тебя хочет поцеловать', reactions.kiss, `целует`)
                break
        }
    }
