const { Message, MessageEmbed, Client } = require('discord.js')
const { embed, roles } = require('../../utility')
const constants = require('../../constants.json')
const sMsg = 'Создание эвента'

/**
 * Command chain: .seve -name(n) -participants(p) -start(-s) -reward(-r)
 * @param {string[]} args
 */
const parser = (args) => {
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
    reward ? reward = Number(reward) : null

    // console.log('reward:', reward, typeof reward)

    if(!name) throw 'название эвента не указано!'
    if(!(parts === null || parts > 0 && parts < 100 && Number.isInteger(parts)))
        throw 'неверное количество участников!'
    if(!(reward === null || reward > 0 && Number.isInteger(reward)))
        throw 'неверно указана награда!'
    if(!start) {
        let date = new Date(Date.now())
        start = date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0')
    }
    if(start.length != 5 || start.indexOf(':') == -1)
        throw 'неверно указано время начала!'

    // return reward
    return [name, parts, start, reward]
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

        var args = msg.content.trim().slice(1).split(" ")
        args.forEach(a => a.trim())
        args.shift()

        try {
            const evData = parser(args)
            const emb = new MessageEmbed()
                .setTitle('⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀Ивент ')
                .setDescription(`\`\`\`${evData[0]}\`\`\``)
                .setImage('https://cdn.discordapp.com/attachments/826179756604391536/847877470048878592/f6952822c6ab4c6e72ae1b2a5d00503b.jpg')
                .setColor('#0xBBECF3')

            if(evData[1]) emb.addField('> Кол-во людей', `\`\`\`${evData[1]}\`\`\``, true)
            if(evData[2]) emb.addField('> Начало ивента', `\`\`\`${evData[2]}\`\`\``, true)
            if(evData[3]) emb.addField('> Награда', `\`\`\`${evData[3]}\`\`\``, true)

            msg.channel.send(emb)

        } catch(err) {
            embed(msg, sMsg, `Ошибка: ${err}`)
        }
    }