const Discord = require('discord.js')
const emojies = ['⬅️', '➡️']
const { sweet } = require('../constants.json').emojies
const utl = require('../utility')
const { DBServer } = utl.db

/** 
 * Build and edit shop message
 *
 * @param {number} page - Page to switch to
 * @param {Discord.Message} msg - Message to edit
 * @param {string} thumbnail - Thumbnail
 * @returns
 */
const buildPage = async (page, msg, thumbnail) => {
    msg = await msg.channel.messages.fetch(msg.id)

    const embed = new Discord.MessageEmbed()
        .setTitle(`Магазин`)
        .setFooter(`Страница ${page}/3 • ${msg.embeds[0].footer.text.slice(msg.embeds[0].footer.text.indexOf('•') + 2)}`)
        .setThumbnail(thumbnail)
        .setColor('#2F3136')

    const server = await new DBServer(msg.guild.id)


    const start = (page - 1) * 9
    const end = server.roles.slice(start, start + 9).length + start

    console.log(start, end)

    for(let i = start; i < end; i++)
        embed.addField(`${i + 1}. — ${server.roles[i].price}${sweet}`, ` <@&${server.roles[i].id}>`, true)

    return msg.edit({ embed: embed })
}

/**
 * Manages "shop" page reactions
 *
 * @param {Discord.MessageReaction} reaction - Reaction
 * @param {Discord.User} user - Reaction's user
 * @param {Discord.Client} client - Bot client
 */
module.exports = (reaction, user, client) => {
    const msg = reaction.message
    if(!(!msg.embeds[0] || !msg.embeds[0].footer || !msg.embeds[0].footer.text.includes('Страница') || user.id == client.user.id || user.bot)) {
        const thumbnail = msg.embeds[0].thumbnail.url

        const text = msg.embeds[0].footer.text
        const user = text.slice(text.indexOf('•') + 2)
        const index = text.slice(text.indexOf('/') - 1, text.indexOf('/'))

        console.log(text, user, index)

        if(user != reaction.users.cache.last().tag)
            return

        if(reaction.emoji.name == '➡️' && index == 1) { // 
            console.log('First page, flip to second')
            buildPage(2, msg, thumbnail)
                .then(async m => {
                    await m.reactions.removeAll()
                    await m.react(emojies[0])
                    await m.react(emojies[1])
                })
        } else if(reaction.emoji.name == '⬅️' && index == 2) { // 
            console.log('Second page, flip to first')
            buildPage(1, msg, thumbnail)
                .then(async m => {
                    await m.reactions.removeAll()
                    await m.react(emojies[1])
                })
        } else if(reaction.emoji.name == emojies[1] && index == 2) { // 
            console.log('Second page, flip to third')
            buildPage(3, msg, thumbnail)
                .then(async m => {
                    await m.reactions.removeAll()
                    await m.react(emojies[0])
                })
        } else if(reaction.emoji.name == emojies[0] && index == 3) { // 
            console.log('Third page, flip to second')
            buildPage(2, msg, thumbnail)
                .then(async m => {
                    await m.reactions.removeAll()
                    await m.react(emojies[0])
                    await m.react(emojies[1])
                })
        }
    }
}