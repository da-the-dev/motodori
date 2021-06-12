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
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] }, { ws: { intents: ['GUILDS', 'GUILD_MESSAGES'] } })
require("discordjs-activity")(client)
require('discord-buttons')(client);
client.prefix = prefix

// Commands
/**
 * 
 * @param {string} dir 
 * @returns {string[]}
 */
function walk(dir) {
    var results = [];
    var list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        var stat = fs.statSync(file);
        if(stat && stat.isDirectory()) {
            /* Recurse into a subdirectory */
            results = results.concat(walk(file));
        } else {
            /* Is a file */
            results.push(file);
        }
    });
    return results;
}
var commandNames = walk('./commands').filter(c => c.endsWith('.js') && !c.includes('utility.js'))
client.commands = new Array()
console.log('[F] Bot functions')
commandNames.forEach(c => {
    client.commands.push({
        'name': c.slice(c.lastIndexOf('/') + 1, c.length - 3),
        'foo': require(c),
        'allowedInGeneral': require(c).allowedInGeneral
    })
    console.log(
        `[F] Name: ${c.slice(c.lastIndexOf('/') + 1, c.length - 3)}; 'allowedInGeneral': ${require(c).allowedInGeneral}`
    )
})

process.stdin.resume();//so the program will not close instantly

function exitHandler(options, exitCode) {
    if(options.cleanup) {
        utl.connections.closeConnections(); console.log('ded')
    }
    if(exitCode || exitCode === 0) console.log(exitCode);
    if(options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }));
process.on('res', exitHandler.bind(null, { cleanup: true }));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));

//catches uncaught exceptions
process.on('uncaughtException', err => {
    exitHandler.bind(null, { exit: true })
    lastMessages = lastMessages.reverse()
    utl.errorReporter(lastMessages.find(m => !m.deleted), err)
    lastMessages = lastMessages.reverse()
    console.log(err)
});

process.on('unhandledRejection', err => {
    lastMessages = lastMessages.reverse()
    utl.errorReporter(lastMessages.find(m => !m.deleted), err)
    lastMessages = lastMessages.reverse()
    console.log(err)
});

// General events
client.login(process.env.BOTTOKEN)
client.once('ready', async () => {
    /**@type {Discord.Guild} */
    client.guild = await client.guilds.fetch('836297404260155432')
    await utl.connections.startconnections(3)

    utl.scanServer(client)
    utl.redisUnmute(client)
    utl.activity.voiceActivityInit(client)
    utl.bannerUpdate(client.guilds.cache.first())
    utl.loveroomMonitor.initPayment(client)
    utl.actionLogs.initLogs(client)
    utl.cRoles.deleteExpired(client)
    utl.eve.sendMessage(client.guild)
    utl.lotery.init(client.guild)

    utl.prmsTracker.reminder(client.guild)
    utl.prmsTracker.remover(client.guild)

    console.log("[BOT] BOT is online")
})

// Role events
client.on('roleUpdate', (oldRole, newRole) => {
    utl.anticrash.monitorRoleAdminPriviligeUpdate(oldRole, newRole)
})
client.on('roleDelete', role => {
    utl.anticrash.monitorRoleDelete(role)
})

// Member events
client.on('guildMemberAdd', async (member) => {
    console.log('GOT ONE')
    await utl.verify.mark(member, client)
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
    utl.gameRoles(client.guild, oldPresence, newPresence)
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
client.on('messageReactionAdd', async (reaction, user) => {
    if(reaction.partial) {
        try {
            await reaction.fetch();
        } catch(error) {
            console.error('Something went wrong when fetching the message: ', error);
            return;
        }
    }

    // if(reaction.message.channel.id != client.verifyMsg)
    utl.prmsTracker.requests(reaction, user, client)
    utl.shop(reaction, user, client)
    utl.eve.reaction(reaction, user)
})
/**@type {Discord.Message[]} */
var lastMessages = []
client.on('message', msg => {
    lastMessages.length < 3 ? lastMessages.push(msg) : null
    // Activity
    utl.activity.chatActivity(msg)
    // Verification
    utl.verify(msg, client)
    // Lotery
    utl.lotery.reward(msg)
    utl.linkRemover(msg)

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
            if(command) {
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
                    return
                }
                else if(args[0] != 'duel' && msg.channel.id != constants.channels.general) {
                    msg.delete()
                        .then(() => {
                            command.foo(args, msg, client)
                        })
                    return
                } else {
                    msg.delete()
                    return
                }
            } else {
                utl.reactionHandler(args, msg, client)
            }
        }
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
})