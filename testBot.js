require('dotenv').config()
const { Client, Message, MessageEmbed } = require('discord.js')
const { embed } = require('./utility')
const { parser } = require('./tests/events/events')

const guildID = '836297404260155432'
const myID = process.env.MYID
const sMsg = 'Создание эвента'

const client = new Client()
client.login(process.env.BOTTOKEN)

client.once('ready', () => {
    console.log('Test Bot standing by!')
})

const buildEmb = (evData) => {
    const emb = new MessageEmbed()
        .setTitle('⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀Ивент ')
        .setDescription(`\`\`\`${evData[0]}\`\`\``)
        .setImage('https://cdn.discordapp.com/attachments/826179756604391536/847877470048878592/f6952822c6ab4c6e72ae1b2a5d00503b.jpg')
        .setColor('#0xBBECF3')

    if(evData[1]) emb.addField('> Кол-во людей', `\`\`\`${evData[1]}\`\`\``, true)
    if(evData[2]) emb.addField('> Начало ивента', `\`\`\`${evData[2]}\`\`\``, true)
    if(evData[3]) emb.addField('> Награда', `\`\`\`${evData[3]}\`\`\``, true)

    return emb
}

client.on('message', msg => {
    if(!msg.author.bot && msg.content.startsWith('!test')) {
        var args = msg.content.trim().slice(1).split(" ")
        args.forEach(a => a.trim())
        args.shift()

    }
})
