// Libraries
const Discord = require('discord.js')
const fs = require('fs')
require('dotenv').config()

// Constants
const constants = require('./constants.json')
const { heart } = constants.emojies

// Utilities
const utl = require('./utility')

// Client
const prefix = "."
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] })
client.prefix = prefix

// Commands
var commandNames = fs.readdirSync(__dirname + '/commands')
client.commands = new Array()
console.log('[F] Bot functions')
commandNames.forEach(c => {
    client.commands.push({
        'name': c.slice(0, c.length - 3),
        'foo': require(__dirname + '/commands/' + c),
        'allowedInGeneral': require(__dirname + '/commands/' + c).allowedInGeneral
    })
    console.log(
        `[F] Name: ${c.slice(0, c.length - 3)}; 'allowedInGeneral': ${require(__dirname + '/commands/' + c).allowedInGeneral}`
    )
})

// General events
client.login(process.env.BOTTOKEN)
client.once('ready', () => {
    console.log("[BOT] BOT is online")

    utl.redisUnmute(client)
    utl.activity.voiceActivityInit(client)
    utl.elderlyRole(client.guilds.cache.first())
    utl.scanServer(client)
    utl.bannerUpdate(client.guilds.cache.first())
    utl.loveroomMonitor.initPayment(client)
})

// Role events
client.on('roleUpdate', (oldRole, newRole) => {
    utl.anticrash.monitorRoleAdminPriviligeUpdate(oldRole, newRole)
})
client.on('roleDelete', role => {
    utl.anticrash.monitorRoleDelete(role)
})

// Member events
client.on('guildMemberAdd', (member) => {
    console.log('+1 member')
    utl.verify.mark(member, client)
    utl.roles.reapplyRoles(member)
    if(member.user.bot)
        utl.anticrash.monitorBotInvites(member)
})
client.on('guildBanAdd', (guild, member) => {
    utl.anticrash.monitorBans(guild, member)
})
client.on('guildMemberRemove', member => {
    console.log('-1 member :(')
    utl.loveroomMonitor.roomDeletion(member)
    utl.anticrash.monitorKicks(member)
})
client.on('presenceUpdate', (oldPresence, newPresence) => {
    utl.gameRoles(oldPresence, newPresence)
})
client.on('guildMemberUpdate', (oldMember, newMember) => {
    utl.boosterTracker(oldMember, newMember)
})

// Channel events
client.on('channelDelete', channel => {
    utl.anticrash.monitorChannelDelete(channel)
})

// Voice events
client.on('voiceStateUpdate', (oldState, newState) => {
    utl.privateRooms.roomDeletion(oldState, newState, client)
    utl.activity.voiceActivity(oldState, newState)
})

// Message events
client.on('messageReactionAdd', (reaction, user) => {
    utl.fetch.fetchReactions(reaction)

    if(reaction.message.channel.id != client.verifyMsg)
        utl.shop(reaction, user, client)
    utl.reportHandler.reportAssignmentHandler(reaction, user, client)
})
client.on('message', msg => {
    // Activity
    utl.activity.chatActivity(msg)

    // Verification
    utl.verify(msg, client)

    // Bot commands
    if(!msg.author.bot) {
        utl.verify.welcomeReward(msg, client)
        if(msg.content[0] == prefix) {
            var args = msg.content.slice(1).split(" ")
            args.forEach(a => a.trim())

            // Say command
            if(args[0].includes('\n'))
                if(args[0].slice(0, args[0].indexOf('\n')) == "say") {
                    client.commands.find(c => c.name == "say").foo(args, msg, client)
                    msg.delete()
                    return
                }

            const command = client.commands.find(c => c.name == args[0])
            if(command)
                if(msg.channel.id == constants.channels.general && command.allowedInGeneral) {
                    msg.delete()
                        .then(() => {
                            command.foo(args, msg, client)
                        })
                }
                else if(args[0] == 'duel' && msg.channel.id == constants.channels.duels) {
                    msg.delete()
                        .then(() => {
                            command.foo(args, msg, client)
                        })
                }
                else if(args[0] != 'duel' && msg.channel.id != constants.channels.general) {
                    msg.delete()
                        .then(() => {
                            command.foo(args, msg, client)
                        })
                } else {
                    msg.delete()
                }


            // Reactions
            // utl.reactionHandler(args, msg, client)
        }
        // Selfy moderation
        if(msg.channel.id == constants.channels.selfie && !msg.author.bot) {
            const checkFile = (msg) => {
                if(msg.attachments.array().length != 1) return false
                const name = msg.attachments.array()[0].name
                return ['.png', '.gif', '.mp4', '.jpeg', '.jpg'].includes(name.slice(name.lastIndexOf('.')))
            }
            if(checkFile(msg))
                msg.react(heart)
            else
                msg.delete()
        }
    }
})