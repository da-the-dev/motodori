require('dotenv').config()
const { Client, Message, MessageEmbed } = require('discord.js')
const { embed, db } = require('./utility')
const { getGuild, Connection } = db
const { parser } = require('./tests/events/events')

const guildID = '836297404260155432'
const myID = process.env.MYID
const sMsg = 'Создание эвента'

const client = new Client()
client.login(process.env.BOTTOKEN)

client.once('ready', async () => {
    console.log('Test Bot standing by!')
    await new Connection()

    var total = [];
    client.guild = client.guilds.cache.get('836297404260155432')
    const guild = await getGuild('836297404260155432')
    guild.forEach(m => {
        const member = client.guild.member(m.id)
        if(!member) return

        if(m.msgs >= 1000 || m.voiceTime >= 600) {
            console.log(member.user.id, m.msgs, m.voiceTime)
            // console.log(m.msgs, m.voiceTime)
            total.push(m.id)
        }
    })
    console.log(total.length)
    Connection.closeAll()
})



client.on('message', msg => {
    if(!msg.author.bot && msg.content.startsWith('!test')) {
        var args = msg.content.trim().slice(1).split(" ")
        args.forEach(a => a.trim())
        args.shift()
    }
})
