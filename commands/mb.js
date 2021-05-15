const Discord = require('discord.js')
const utl = require('../utility')
const constants = require('../constants.json')
const { dot } = require('../constants.json').emojies

const getStatus = (msg, id) => {
    return `<${msg.guild.member(id).user.presence.status == 'online' ? constants.emojies.true : constants.emojies.false}>`
}
/**
 * 
 * @param {Discord.Message} msg 
 * @param {*} id 
 * @returns 
 */
const getAvalible = (msg, id) => {
    return `${msg.guild.member(id).voice.channel ? '`-`' : '`+`'}`
}

module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .mb
    */
    (args, msg, client) => {

        var embed = new Discord.MessageEmbed()
            .setColor('#2F3136')
            .setTitle(`${dot}Статусы музыкальных ботов`)
            .addFields(
                [
                    {
                        "name": "> <:__:829731061621456906> • Chip",
                        "value": `> Состояние: ${getStatus(msg, '614109280508968980')}\n> Префикс: \`*\`\n> **Доступен:** ${getAvalible(msg, '614109280508968980')}`,
                        "inline": true
                    },
                    {
                        "name": "> <:__:829735645948674118> • Rythm",
                        "value": `> Состояние: ${getStatus(msg, '235088799074484224')}\n> Префикс: \`>\`\n> **Доступен:** ${getAvalible(msg, '235088799074484224')}`,
                        "inline": true
                    },
                    {
                        "name": "> <:__:829735646453170176> • Groovy",
                        "value": `> Состояние: ${getStatus(msg, '234395307759108106')}\n> Префикс: \`+\`\n> **Доступен:** ${getAvalible(msg, '234395307759108106')}`,
                        "inline": true
                    },
                    {
                        "name": "> <:__:829731061621456906> • Chip 2",
                        "value": `> Состояние: ${getStatus(msg, '679643572814741522')}\n> Префикс: \`**\`\n> **Доступен:** ${getAvalible(msg, '679643572814741522')}`,
                        "inline": true
                    },
                    {
                        "name": "> <:__:829735646615568425> • Rythm 2",
                        "value": `> Состояние: ${getStatus(msg, '252128902418268161')}\n> Префикс: \`>>\`\n> **Доступен:** ${getAvalible(msg, '252128902418268161')}`,
                        "inline": true
                    },
                    {
                        "name": "> <:__:829735647035129896> • Octave",
                        "value": `> Состояние: ${getStatus(msg, '201503408652419073')}\n> Префикс: \`++\`\n> **Доступен:** ${getAvalible(msg, '201503408652419073')}`,
                        "inline": true
                    }
                ]
            )

        msg.channel.send(embed)
    }
