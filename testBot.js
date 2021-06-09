require('dotenv').config()
const { Client, Message, MessageEmbed } = require('discord.js')
const psact = require('./commands/prs/psact.js')

const { prmsTracker, fetch, db } = require('./utility')
const { Connection } = db

const client = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER'] });
require("discordjs-activity")(client)
require('discord-buttons')(client);
client.login(process.env.BOTTOKEN)

// Catch errors and close connections before shutdown
process.stdin.resume()
function exitHandler(options, exitCode) {
    if(options.cleanup)
        null
    // Connection.closeAll()
    if(exitCode || exitCode === 0) console.log(exitCode);
    if(options.exit) process.exit();
}
process.on('SIGINT', exitHandler.bind(null, { exit: true }));
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));
process.on('unhandledRejection', exitHandler.bind(null, { exit: true }));

client.once('ready', async () => {
    // await new Connection()
    client.guild = await client.guilds.fetch('836297404260155432')
    console.log('Test Bot standing by!')
})

client.on('messageReactionAdd', async (reaction, user) => {
    prmsTracker.requests(reaction, user, client)
})

client.on('message', msg => {
    if(!msg.author.bot && msg.author.id == process.env.MYID) {
        var args = msg.content.slice(1).split(" ")
        args.forEach(a => a.trim())

        psact(args, msg, client)
    }
})