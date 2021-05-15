const Discord = require('discord.js')
const constants = require('../constants.json')
const { dot } = constants.emojies
const utl = require('../utility')
const sMsg = 'Приватные комнаты'

/**
 * @description Create the "creator" voice channel
 * @param {Discord.Client} client
 */
module.exports.createRoom = (client) => {
    var privateRoomCategory = client.guilds.cache.first().channels.cache.get(constants.categories.privateRooms)
    client.guilds.cache.first().channels.create('[﹢]．Создать',
        {
            type: "voice",
            permissionOverwrites:
                [
                    {
                        id: constants.roles.muted,
                        deny: ["CONNECT"]
                    },
                    {
                        id: constants.roles.toxic,
                        allow: ['VIEW_CHANNEL', "CONNECT"]
                    },
                    {
                        id: constants.roles.localban,
                        deny: ['VIEW_CHANNEL', "CONNECT"]
                    },
                    {
                        id: client.guilds.cache.first().id,
                        allow: ['VIEW_CHANNEL', "CONNECT"]
                    },
                    {
                        id: constants.roles.verify,
                        deny: ['VIEW_CHANNEL', "CONNECT"]
                    }
                ],
            parent: privateRoomCategory,
            userLimit: 1
        }).then(c => client.creator = c.id)
}

/**
 * @description Handles private room deletion
 * @param {Discord.VoiceState} oldState 
 * @param {Discord.VoiceState} newState  
 */
module.exports.roomDeletion = (oldState, newState, client) => {
    // Ignore if channel didn't change
    if(oldState.channelID == newState.channelID)
        return

    // Create private room
    if(newState.channel && newState.member.voice.channel.id == client.creator) {
        var guild = newState.member.guild
        /**@type {Discord.CategoryChannel} */
        var category = guild.channels.cache.get(constants.categories.privateRooms)
        console.log(newState.channel.position)
        guild.channels.create(newState.member.user.username,
            {
                type: 'voice',
                permissionOverwrites:
                    [
                        {
                            id: constants.roles.verify,
                            deny: ['VIEW_CHANNEL', 'CONNECT', 'CREATE_INSTANT_INVITE']
                        },
                        {
                            id: newState.member.guild.id,
                            deny: ['CREATE_INSTANT_INVITE']
                        },
                        {
                            id: constants.roles.muted,
                            deny: ['CONNECT', 'CREATE_INSTANT_INVITE']
                        },
                        {
                            id: constants.roles.toxic,
                            deny: ['CREATE_INSTANT_INVITE']
                        },
                        {
                            id: constants.roles.localban,
                            deny: ['VIEW_CHANNEL', 'CONNECT', 'CREATE_INSTANT_INVITE']
                        },
                        {
                            id: newState.member.user.id,
                            allow: ['VIEW_CHANNEL', 'CONNECT', 'CREATE_INSTANT_INVITE']
                        },
                        {
                            id: constants.roles.bot,
                            allow: ['MANAGE_CHANNELS', 'CONNECT', 'SPEAK', 'MOVE_MEMBERS']
                        }
                    ],
                parent: category,
            })
            .then(c => {
                newState.member.voice.setChannel(c, 'Перемещаю в приватную команату')
                c.setPosition(category.children.size - 1)
            })
    }

    if(oldState.channel && oldState.channel.id != client.creator && oldState.channel.parentID == constants.categories.privateRooms) {
        var channel = oldState.channel
        if(channel.members.size <= 0 && !channel.deleted) {
            channel.delete()
            return
        }
        var oldOwner = oldState.member

        if(oldOwner.permissionsIn(channel).has('CREATE_INSTANT_INVITE') && channel.permissionOverwrites.get(oldOwner.id)) {
            channel.permissionOverwrites.get(oldOwner.id).delete() // Delete old owner perms
                .then(c => {
                    var newOwner = channel.members.find(m => !m.permissionsIn(channel).has('CREATE_INSTANT_INVITE'))
                    if(!newOwner) return
                    channel.updateOverwrite(newOwner.id, { 'CREATE_INSTANT_INVITE': true })

                    newOwner.guild.channels.cache.get(constants.channels.cmd).send(`<@${newOwner.id}>`, {
                        embed: new Discord.MessageEmbed()
                            .setTitle(`${dot}${sMsg}`)
                            .setDescription(`Вы были назначены овнером приватной комнаты **${channel.name}**`)
                            .setThumbnail(newOwner.user.displayAvatarURL({ dynamic: true }))
                            .setColor('#2F3136')
                    })
                })
        }
    }
}