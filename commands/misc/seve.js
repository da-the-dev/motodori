const { Message, MessageEmbed, Client } = require('discord.js')
const { embed, roles } = require('../../utility')
const constants = require('../../constants.json')
const sMsg = 'Создание эвента'

/**
 * Command chain: .seve -name(n) -participants(p) -start(-s) -reward(-r)
 * @param {string[]} args
 */
const parser = (args) => {
    args.shift()
    if(args.length <= 0)
        throw 'no args'
    const finder = (args, long, short) => {
        var res = null
        // console.log(long, args.indexOf(`- ${ long }`), args.indexOf(` - ${ short }`))
        if(args.indexOf(`-${long}`) != -1)
            res = args[args.indexOf(`-${long}`) + 1]
        else if(args.indexOf(`-${short}`) != -1)
            res = args[args.indexOf(`-${short}`) + 1]

        // console.log(res)
        return res
    }

    var name = finder(args, 'name', 'n')
    var parts = finder(args, 'participants', 'p')
    var start = finder(args, 'start', 's') //HH:MM || now
    var reward = finder(args, 'reward', 'r')


    parts ? parts = Number(parts) : null

    // console.log('reward:', reward, typeof reward)

    if(!name) throw 'название эвента не указано!'
    if(!(parts === null || parts > 0 && parts < 100 && Number.isInteger(parts)))
        throw 'неверное количество участников!'

    // Reward check
    if(Number.isInteger(Number(reward)) && reward !== undefined) {
        if(Number(reward) > 0 && reward !== null) reward += ' Yen'
        else if(reward !== null) throw 'неверная награда!'
    }
    else if(!(reward !== null && !Number(reward) && reward !== undefined) && reward !== null)
        throw 'неверная награда!'


    if(!start || start.length != 5 || start.indexOf(':') == -1 || Number(start.slice(0, 2)) >= 24 || Number(start.slice(3, 5)) >= 60)
        throw 'неверно указано время начала!'

    // return reward
    return [name, parts, start, reward]
}

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

module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Message} msg Discord message object
    * @param {Client} client Discord client object
    * @description Usage: .seve -name(n) -participants(p) -start(-s) -reward(-r)
    */
    async (args, msg, client) => {
        if(!roles.privilage(msg.member, msg.guild.roles.cache.get(constants.roles.eventer))) {
            embed.ping(msg, sMsg, 'у Вас нет права на эту команду!')
            return
        }

        try {
            const emb = buildEmb(parser(args))
            msg.channel.send(emb)
        } catch(err) {
            if(err == 'no args') {
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
            else
                embed(msg, sMsg, `Ошибка: ${err}`)
        }
    }