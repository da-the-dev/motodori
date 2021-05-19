const Discord = require('discord.js')
const utl = require('../utility')
const reactions = require('./reactions')
const sMsg = 'Реакции'

var lastRandom = null
function random(size) {
    var rand = Math.floor(Math.random() * size)
    if(lastRandom == rand)
        rand(size)
    else {
        return rand
    }
}


/**
 * Checks for partner
 * @param {Discord.Message} msg - OG message
 * @param {Discord.GuildMember} member 
 */
function checkForPartner(msg, member) {
    if(!member || msg.author.id == member.id) {
        utl.embed(msg, sMsg, 'Не лучшая идея')
        return false
    }
    return true
}
/**
 * Builds an embed for solo reactions
 * @param {Discord.Message} msg - OG message
 * @param {string} member - Who sent the messsage
 * @param {string[]} gifs - GIFs array
 * @param {string} description - Description
 * @returns {Discord.MessageEmbed}
 */
function solo(msg, member, gifs, description) {
    const rand = random(gifs.length)

    msg.channel.send(utl.embed.build(msg, sMsg, `<@${member}> ${description}`)
        .setImage(gifs[rand])
        .setThumbnail())
}
/**
 * Builds an embed for paired reactions without permissinon
 * @param {Discord.Message} msg - OG message
 * @param {string} member - Who sent the messsage
 * @param {string} reciever - Who was pinged in the messsage
 * @param {string[]} gifs - GIFs array
 * @param {string} description - Description
 * @returns {Discord.MessageEmbed}
 */
function pair(msg, member, reciever, gifs, description) {
    const rand = random(gifs.length)
    msg.channel.send(utl.embed.build(msg, sMsg, `<@${member}> ${description} <@${reciever}> `)
        .setImage(gifs[rand])
        .setThumbnail())
}
/**
 * Builds an embed for paired reactions with permissinon
 * @param {Discord.Message} msg - OG message
 * @param {string} member - Who sent the messsage
 * @param {string} reciever - Who was pinged in the messsage
 * @param {string[]} gifs - GIFs array
 * @param {string} question - Question before consent
 * @param {string} description - Description
 * @returns {Discord.MessageEmbed}
 */
function pairPerm(msg, member, reciever, gifs, question, description) {
    const rand = random(gifs.length)

    const requestEmbed = new Discord.MessageEmbed()
        .setDescription(`<@${reciever}>, ${question} <@${member}>, что ответишь ?`)
        .setColor('#2F3136')

    msg.channel.send(requestEmbed)
        .then(async m => {
            utl.reactionSelector.yesNo(m, reciever,
                () => {
                    m.edit(utl.embed.build(msg, sMsg, `<@${member}> ${description} <@${reciever}>`)
                        .setImage(gifs[rand])
                        .setThumbnail())
                    m.reactions.removeAll()
                },
                () => {
                    m.edit(utl.embed.build(msg, sMsg, `<@${reciever}> тебе отказал(-а)`))
                    m.reactions.removeAll()
                },
                () => {
                    m.edit(utl.embed.build(msg, sMsg, `<@${reciever}> тебя проигнорировал(-а)`))
                    m.reactions.removeAll()
                }
            )
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
        const mMember = msg.mentions.members.first()
        switch(args[0]) {
            case 'angry':
                mMember ? pair(msg, msg.author.id, mMember.id, reactions.angry, `разозлился(-ась) на`) : solo(msg, msg.member.id, reactions.angry, 'злится')
                break
            case 'hit':
                checkForPartner(msg, mMember) ? pair(msg, msg.author.id, mMember.id, reactions.hit, `ударил(-а)`) : null
                break

            case 'hug':
                checkForPartner(msg, mMember) ? pair(msg, msg.author.id, mMember.id, reactions.hug, `обнял(-а)`) : null
                break
            case 'sad':
                solo(msg, msg.author.id, reactions.sad, 'плачет')
                break

            case 'bite':
                checkForPartner(msg, mMember) ? pair(msg, msg.author.id, mMember.id, reactions.bite, `укусил(-а)`) : null
                break
            case 'smoke':
                solo(msg, msg.author.id, reactions.smoke, 'курит')
                break

            case 'tea':
                solo(msg, msg.author.id, reactions.tea, 'наслаждается чаем')
                break
            case 'kiss':
                checkForPartner(msg, mMember) ? pairPerm(msg, msg.author.id, mMember.id, reactions.kiss, 'хочет тебя поцеловать', 'целует') : null
                break

            case 'seduce':
                checkForPartner(msg, mMember) ? pair(msg, msg.author.id, mMember.id, reactions.seduce, `совращает`) : null
                break
        }
        if(['angry', 'hit', 'hug', 'sad', 'bite', 'smoke', 'tea', 'kiss', 'seduce'].includes(args[0])) msg.delete()
    }
