const { Client, User, MessageReaction, MessageEmbed } = require('discord.js')
const { embed, fetch, db } = require('../utility')
const { DBServer } = db
const constants = require('../constants.json')

/**
 * Handles report reactions
 * @param {MessageReaction} reaction - Reaction
 * @param {User} user - Reaction's user
 * @param {Client} client - Bot client
 */
module.exports = async (reaction, user, client) => {
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
        }
    }
}