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

        try {
            const emb = buildEmb(parser(args))
            msg.channel.send(emb)
        } catch(err) {
            if(err == 'no args')
                interactive(msg)
            else
                embed(msg, sMsg, `Ошибка: ${err}`)
        }
    }
})

/**
 * 
 * @param {Message} msg 
 */
const interactive = async (msg) => {
    var name = null
    var parts = null
    var start = null
    var reward = null

    /**@type {Message[]} */
    var messages = []

    const deleteMessages = () => {
        messages.forEach(m => {
            if(m.deletable) m.delete()
        })
    }
    try {
        const filter = m => m.author.id == msg.author.id
        messages.push(await embed(msg, sMsg, 'Укажите название эвента'))
        await msg.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ['time'] })
            .then(collected => {
                messages.push(collected.first())
                name = collected.first().content
            })
            .catch(() => {
                embed(msg, sMsg, 'Не указано имя эвента!')
                throw 'no event name'
            })

        messages.push(await embed(msg, sMsg, 'Укажите количество учасников или `-`'))
        await msg.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ['time'] })
            .then(collected => {
                messages.push(collected.first())

                parts = collected.first().content
                const incorrect = embed.build(msg, sMsg, 'Неверное количество участников!')
                if(parts == '-') parts = null
                else if(!(parts > 0 && parts < 100 && Number.isInteger(Number(parts)))) {
                    msg.channel.send(incorrect)
                    throw 'invalid parts'
                }
            })
            .catch(() => {
                msg.channel.send(incorrect)
                throw 'invalid parts'
            })

        messages.push(await embed(msg, sMsg, 'Укажите время'))
        await msg.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ['time'] })
            .then(collected => {
                messages.push(collected.first())

                start = collected.first().content
                const incorrect = embed.build(msg, sMsg, 'Неверное время!')
                if(!start || start.length != 5 || start.indexOf(':') == -1 || Number(start.slice(0, 2)) >= 24 || Number(start.slice(3, 5)) >= 60) {
                    msg.channel.send(incorrect)
                    throw 'invalid time'
                }
            })
            .catch(() => {
                msg.channel.send(incorrect)
                throw 'invalid time'
            })

        messages.push(await embed(msg, sMsg, 'Укажите награду или `-`'))
        await msg.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ['time'] })
            .then(collected => {
                messages.push(collected.first())

                reward = collected.first().content
                const incorrect = embed.build(msg, sMsg, 'Неверная награда!')
                if(reward == '-') reward = null
                else if(Number.isInteger(Number(reward))) {
                    reward += ' Yen'
                }
            })
            .catch(() => {
                msg.channel.send(incorrect)
                throw 'invalid time'
            })
        deleteMessages()
        msg.channel.send(buildEmb([name, parts, start, reward]))
    } catch(err) {
        deleteMessages()
    }
}
