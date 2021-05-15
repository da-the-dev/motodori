const Discord = require('discord.js')
const utl = require('../utility')

/**@param {Discord.Client} */
const getTime = (client) => {
    var date = new Date(client.uptime)
    var hours = date.getHours() + date.getTimezoneOffset() / 60
    var minutes = date.getMinutes()
    var seconds = date.getSeconds()

    if(hours < 10)
        hours = '0' + hours.toString()
    else
        hours = hours.toString()

    if(minutes < 10)
        minutes = '0' + minutes.toString()
    else
        minutes = minutes.toString()

    if(seconds < 10)
        seconds = '0' + seconds.toString()
    else
        seconds = seconds.toString()

    return hours + ':' + minutes + ':' + seconds
}

module.exports =
    /**
     * @param {Array<string>} args Command argument
     * @param {Discord.Message} msg Discord message object
     * @param {Discord.Client} client Discord client object
     * @description Usage: .info
    */
    (args, msg, client) => {
        var memoryUsed = process.memoryUsage().heapUsed / 1024 / 1024

        var info =
            utl.embed.build(msg, 'Информация о боте')
                .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                .addField('Автор бота', `\`\`\`${client.users.cache.find(u => u.id == process.env.MYID).tag}\`\`\``, true)
                .addField('Префикс', '```.```', true)
                .addField('Использование RAM', `\`\`\`${memoryUsed.toFixed(2)} MB\`\`\``, true)
                .addField('Язык Программирования', '```JavaScript```', true)
                .addField('Задержка', `\`\`\`${Math.floor(client.ws.ping)}\`\`\``, true)
                .addField('Время активности', `\`\`\`${getTime(client)}\`\`\``, true)
        msg.channel.send(info)
    }