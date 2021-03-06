const Discord = require('discord.js')
const constants = require('../constants.json')
const sMsg = 'Приватные комнаты'

/**
 * Create the "creator" voice channel
 * 
 * @param {Discord.Client} client
 */
module.exports.createRoom = (client) => {
    const privateRoomCategory = client.guild.channels.cache.get(constants.categories.privateRooms)
    client.guild.channels.create('Tap to Create +꙳',
        {
            type: 'voice',
            permissionOverwrites: [
                {
                    id: constants.roles.muted,
                    deny: ['CONNECT']
                },
                {
                    id: constants.roles.toxic,
                    allow: ['VIEW_CHANNEL', 'CONNECT']
                },
                {
                    id: constants.roles.localban,
                    deny: ['VIEW_CHANNEL', 'CONNECT']
                },
                {
                    id: client.guild.id,
                    allow: ['VIEW_CHANNEL', 'CONNECT']
                },
                {
                    id: constants.roles.verify,
                    deny: ['VIEW_CHANNEL', 'CONNECT']
                }
            ],
            parent: privateRoomCategory,
            userLimit: 1,
            position: 0

        }).then(c => client.creator = c.id)
        .catch(err => console.log(err))
}

/**
 * Handles private room deletion
 * 
 * @param {Discord.VoiceState} oldState 
 * @param {Discord.VoiceState} newState  
 * @param {Discord.Client} client
 */
module.exports.roomDeletion = (oldState, newState, client) => {
    // Ignore if channel didn't change
    if(oldState.channelID == newState.channelID)
        return

    // Create private room
    if(newState.channel && newState.member.voice.channel.id == client.creator) {
        const guild = newState.member.guild
        /**@type {Discord.CategoryChannel} */
        const category = guild.channels.cache.get(constants.categories.privateRooms)
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
        const channel = oldState.channel
        if(channel.members.size <= 0 && !channel.deleted) {
            channel.delete()
            return
        }
        const oldOwner = oldState.member

        if(oldOwner.permissionsIn(channel).has('CREATE_INSTANT_INVITE') && channel.permissionOverwrites.get(oldOwner.id)) {
            channel.permissionOverwrites.get(oldOwner.id).delete() // Delete old owner perms

            let newOwner = channel.members.find(m => !m.permissionsIn(channel).has('CREATE_INSTANT_INVITE'))
            !newOwner ? newOwner = channel.members.first() : null

            channel.updateOverwrite(newOwner.id, { 'CREATE_INSTANT_INVITE': true })

            newOwner.guild.channels.cache.get(constants.channels.cmd).send(`<@${newOwner.id}>`, {
                embed: new Discord.MessageEmbed()
                    .setTitle(`${sMsg}`)
                    .setDescription(`Вы были назначены овнером приватной комнаты **${channel.name}**`)
                    .setThumbnail(newOwner.user.displayAvatarURL({ dynamic: true }))
                    .setColor('#2F3136')
            })

        }
    }
}