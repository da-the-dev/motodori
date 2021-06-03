require('dotenv').config()
const { Client, Message, MessageEmbed } = require('discord.js')
const { embed, db, redisConnection, lotery, redisUnmute } = require('./utility')
const { getGuild, Connection } = db
const { parser } = require('./tests/events/events')

const guildID = '836297404260155432'
const myID = process.env.MYID
const sMsg = 'Создание эвента'

const client = new Client()
console.log('login')
client.login(process.env.BOTTOKEN)

client.once('ready', async () => {
    await new RedisConnection()
    await new Connection()
    redisUnmute(client)
    client.guild = await client.guilds.fetch('836297404260155432')
    console.log('Test Bot standing by!')
    await new Connection()

    const { init } = require('./utility/lotery')

    await init(client.guilds.cache.get('836297404260155432'))
})

client.on('message', msg => {
    if(!msg.author.bot && msg.author.id == process.env.MYID) {
        // Lotery
        lotery.reward(msg)
    }
})

process.stdin.resume();//so the program will not close instantly

function exitHandler(options, exitCode) {
    if(options.cleanup) {
        RedisConnection.closeAll()
        Connection.closeAll()
        console.log('ded')
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
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));
