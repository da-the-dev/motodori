const Discord = require('discord.js')
const utl = require('../utility')
const constants = require('../constants.json')
const sMsg = 'Баг'
module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .bug <text>
    */
    (args, msg, client) => {
        args.shift()
        if(args.length <= 0) {
            utl.embed.ping(msg, sMsg, 'Не указано содержание бага!')
            return
        }

        utl.embed(msg, sMsg, 'Баг репорт отправлен, спасибо!').then(m => {
            var embed = new Discord.MessageEmbed()
                .setTitle(`Новый баг от: ${msg.member.displayName}`)
                .setDescription(args.join(' ') + `\n[Ссылка на сообщение](${m.url})`)
                .setColor('#42cbf5')

            if(msg.attachments)
                msg.guild.channels.cache.get(constants.channels.bugs).send(`<@${process.env.MYID}>`, {
                    embed: embed, files: msg.attachments.map(a => { return { attachment: a.attachment, name: a.name } })
                })
            else
                msg.guild.channels.cache.get(constants.channels.bugs).send(`<@${process.env.MYID}>`, { embed: embed })
        })

    }
