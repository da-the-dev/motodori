const Discord = require('discord.js')
const emojies = ['➡️', '⬅️']
const { dot, sweet } = require('../constants.json').emojies
const utl = require('../utility')

/** 
 * Build and edit shop message
 * @param {number} page - Page to switch to
 * @param {Discord.Message} msg - Message to edit
 * @param {string} thumbnail - Thumbnail
 */
const buildPage = async (page, msg, thumbnail) => {
    msg = await msg.channel.messages.fetch(msg.id)

    var embed = new Discord.MessageEmbed()
        .setTitle(`${dot}Магазин`)
        .setFooter(`Страница ${page}/2 • ${msg.embeds[0].footer.text.slice(msg.embeds[0].footer.text.indexOf('•') + 2)}`)
        .setThumbnail(thumbnail)
        .setColor('#2F3136')

    utl.db.createClient(process.env.MURL).then(db => {
        db.get(msg.guild.id, 'serverSettings').then(serverSettings => {
            if(serverSettings) {
                db.close()
                var length = serverSettings.roles.slice((page - 1) * 9, (page - 1) * 9 + 9).length + (page - 1) * 9
                for(i = (page - 1) * 9; i < length; i++)
                    embed.addField(`${i + 1}. — ${serverSettings.roles[i].price}${sweet}`, ` <@&${serverSettings.roles[i].id}>`)

                msg.edit(embed)
                    .then(async m => {
                        await m.reactions.removeAll()
                        await m.react(emojies[page - 1])
                    })
            }
        })
    })
}

/**
 * Manages "shop" page reactions
 * @param {Discord.MessageReaction} reaction - Reaction
 * @param {Discord.User} user - Reaction's user
 * @param {Discord.Client} client - Bot client
 */
module.exports = (reaction, user, client) => {
    var msg = reaction.message
    if(!(!msg.embeds[0] || !msg.embeds[0].footer || !msg.embeds[0].footer.text.includes('Страница') || user.id == client.user.id || user.bot)) {
        var thumbnail = msg.embeds[0].thumbnail.url

        const text = msg.embeds[0].footer.text
        var user = text.slice(text.indexOf('•') + 2)
        var index1 = text.slice(0, text.indexOf('•')).indexOf('1')

        if(user != reaction.users.cache.last().tag)
            return

        if(reaction.emoji.name == '⬅️' && index1 == -1) { // 
            console.log('Second page, flip to first')
            buildPage(1, msg, thumbnail)
        }
        else if(reaction.emoji.name == '➡️' && index1 != -1) { // 
            console.log('First page, flip to second')
            buildPage(2, msg, thumbnail)
        }
    }
}