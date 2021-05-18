const Discord = require('discord.js')
const utl = require('../utility')
const { DBServer, getConnection } = utl.db
const { sweet } = require('../constants.json').emojies
const emojies = ['⬅️', '➡️']

module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .shop
    */
    async (args, msg, client) => {
        var embed = utl.embed.build(msg, 'Магазин')
            .setFooter(`Страница 1/3 • ${msg.author.tag}`)

        const server = await new DBServer(msg.guild.id, getConnection())

        var rolesData = server.roles
        rolesData.sort((a, b) => {
            if(a.pos > b.pos) return 1
            if(a.pos < b.pos) return -1
            return 0
        })

        var length = rolesData.slice(0, 9).length
        var description = ''
        for(i = 0; i < length; i++)
            embed.addField(`${i + 1}. — ${server.roles[i].price}${sweet}`, ` <@&${server.roles[i].id}>`, true)

        msg.channel.send(embed)
            .then(async m => {
                await m.react(emojies[1])
            })
    }