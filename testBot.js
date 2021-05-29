require('dotenv').config()
const { Client, Message, MessageEmbed } = require('discord.js')
const { embed } = require('./utility')

const guildID = '836297404260155432'
const myID = process.env.MYID

const client = new Client()
client.login(process.env.BOTTOKEN)

client.once('ready', () => {
    console.log('Test Bot standing by!')
})

client.on('message', msg => {
    if(!msg.author.bot && msg.content.startsWith('!test')) {
        var args = msg.content.trim().slice(1).split(" ")
        args.forEach(a => a.trim())

        // Stuff happens here
    }
})

