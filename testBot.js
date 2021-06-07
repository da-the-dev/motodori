require('dotenv').config()
const { Client, Message, MessageEmbed } = require('discord.js')
const pcreate = require('./commands/personarms/pcreate')
const pdelete = require('./commands/personarms/pdelete')
const padd = require('./commands/personarms/padd')
const pkick = require('./commands/personarms/pkick')
const { prmsRequestTracker, fetch, db } = require('./utility')
const { Connection } = db

const client = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER'] });
client.login(process.env.BOTTOKEN)

// Catch errors and close connections before shutdown
process.stdin.resume()
function exitHandler(options, exitCode) {
    if(options.cleanup)
        Connection.closeAll()
    if(exitCode || exitCode === 0) console.log(exitCode);
    if(options.exit) process.exit();
}
process.on('SIGINT', exitHandler.bind(null, { exit: true }));
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));
process.on('unhandledRejection', exitHandler.bind(null, { exit: true }));

client.once('ready', async () => {
    await new Connection()
    client.guild = await client.guilds.fetch('836297404260155432')
    console.log('Test Bot standing by!')
})

client.on('messageReactionAdd', async (reaction, user) => {
    prmsRequestTracker(reaction, user, client)
})

client.on('message', msg => {
    if(!msg.author.bot && msg.author.id == process.env.MYID) {
        var args = msg.content.slice(1).split(" ")
        args.forEach(a => a.trim())

        if(msg.content.startsWith('!test'))
            pcreate(args, msg, client)
        else if(msg.content.startsWith('!del'))
            pdelete(args, msg, client)
        else if(msg.content.startsWith('!add'))
            padd(args, msg, client)
        else if(msg.content.startsWith('!kick'))
            pkick(args, msg, client)
    }
})