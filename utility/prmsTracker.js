const { Client, User, MessageReaction, MessageEmbed, Guild } = require('discord.js')
const { fetch, db } = require('../utility')
const { DBServer } = db
const { scheduleJob } = require('node-schedule')
const constants = require('../constants.json')
const { timeCalculator } = require('./time')

/**
 * Handles report reactions
 * @param {MessageReaction} reaction - Reaction
 * @param {User} user - Reaction's user
 * @param {Client} client - Bot client
 */
module.exports.requests = async (reaction, user, client) => {
    if(reaction.message.channel.id == constants.channels.prmsRequests) {
        // Fetch the message
        await fetch.fetchReactions(reaction)
        // If request is confirmed
        switch(reaction.emoji.name) {
            case "✅":
                if(user.id != client.user.id) {
                    const embed = reaction.message.embeds[0]
                    const requestUser = reaction.message.guild.member(embed.fields[0].value.slice(2, -1)).user
                    const name = embed.fields[1].value.slice(3, -3)

                    if(!user) {
                        reaction.message.edit(new MessageEmbed({
                            "title": "Участника больше нет на сервере!",
                            "color": 15406156
                        }))
                        return
                    }

                    const c = await reaction.message.guild.channels.create(name, {
                        type: 'voice',
                        permissionOverwrites: [
                            {
                                id: reaction.message.guild.id,
                                deny: ['CONNECT', 'CREATE_INSTANT_INVITE']
                            },
                            {
                                id: requestUser.id,
                                allow: ['CONNECT', 'CREATE_INSTANT_INVITE']
                            }
                        ],
                        parent: reaction.message.guild.channels.cache.get('847850737710268456')
                    })

                    const dm = await user.createDM()
                    dm.send(new MessageEmbed({
                        "title": "Ваша заявка на создание личной комнаты была одобрена!",
                        "description": `Ссылка на личную комнату:\n${(await c.createInvite()).url}`,
                        "color": 53380
                    }))

                    const server = await new DBServer(reaction.message.guild.id)
                    server.personaRooms.push({
                        id: c.id,
                        creator: requestUser.id,
                        createdTimestamp: c.createdTimestamp,
                        approver: user.id,
                        activity: 0,
                        deletionTimestamp: Date.now() + 604800000 // Add a week to new date
                    })
                    server.save()

                    reaction.message.edit(new MessageEmbed({
                        "description": `**Заявка ${requestUser} на создание личной комнаты была одобрена ${user}**`,
                        "color": 53380
                    }))
                    reaction.message.reactions.removeAll()
                }
                break
            case "❌":
                reaction.message.edit(new MessageEmbed({
                    "description": `**Заявка ${requestUser} на создание личной комнаты была отвергнута ${user}**`,
                    "color": 15406156
                }))
                reaction.message.reactions.removeAll()
                break
        }
    }
}

/**
 * Remind personal rooms' owner if their rooms have not enough activity
 * @param {Guild} guild
 */
module.exports.reminder = (guild) => {
    // Run every Friday
    scheduleJob('* * * * * 5', async () => {
        const server = await new DBServer(guild.id)
        if(server.personaRooms) {
            server.personaRooms.forEach(r => {
                if(r.deletionTimestamp - Date.now() <= 2 * 86400000 && r.activity < 21 * 60)
                    guild.member(r.creator).user.createDM().then(dm => {
                        dm.send(new MessageEmbed(
                            {
                                "title": "Ваша личная комната скоро будет удалена!",
                                "description": `Ваша комната пока не набрала необходимого количества актива и будет удалена менее, чем через **2 дня**! Если Вы считаете, что не сможете набрать недостающий актив *(а именно ${timeCalculator(21 * 60 - r.activity * 60)}*, то предлагаю выкуп за **${Math.ceil((21 * 60 - r.activity * 60) / 60) * 100}** *(1 час = 100, округление в большую сторону)*. Для выкупа, напишите \`.ppay\` в <#${constants.channels.cmd}>`,
                                "color": 15406156
                            }
                        ))
                    })
            })
        }
    })
}

/**
 * Delete personal rooms if they have not enough activity
 * @param {Guild} guild 
 */
module.exports.remover = guild => {
    // Run every Sunday
    scheduleJob('* * * * * 0', async () => {
        const server = await new DBServer(guild.id)
        if(server.personaRooms) {
            server.personaRooms.forEach(r => {
                if(r.activity < 21 * 60 && r.createdTimestamp >= 604800000) {
                    const channel = guild.channels.cache.get(r.id)
                    guild.member(r.creator).user.createDM()
                        .then(dm => {
                            dm.send(new MessageEmbed({
                                "title": "Ваша личная комната была удалена за неактивность!"
                            }))
                        })

                    guild.channels.cache.get(constants.channels.prmsRequests).send(new MessageEmbed({
                        "title": `Личная комната ${channel.name} была удалена за неактивность!`,
                        "description": `**Автор комнаты: ${r.creator}**`
                    }))
                    channel.delete()
                    server.personaRooms.splice(server.personaRooms.indexOf(r), 1)
                }
            })
            server.save()
        }
    })
}