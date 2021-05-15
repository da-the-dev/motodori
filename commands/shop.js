const Discord = require('discord.js')
const utl = require('../utility')
const { dot, sweet } = require('../constants.json').emojies
const emojies = ['⬅️', '➡️']

module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .shop
    */
    (args, msg, client) => {
        var embed = utl.embed.build(msg, 'Магазин')
            .setFooter(`Страница 1/2 • ${msg.author.tag}`)

        utl.db.createClient(process.env.MURL).then(db => {
            db.get(msg.guild.id, 'serverSettings').then(serverData => {
                if(serverData) {
                    db.close()

                    var rolesData = serverData.roles
                    rolesData.sort((a, b) => {
                        if(a.pos > b.pos) return 1
                        if(a.pos < b.pos) return -1
                        return 0
                    })

                    var length = rolesData.slice(0, 9).length
                    for(i = 0; i < length; i++)
                        embed.addField(`${i + 1}. — ${serverData.roles[i].price}${sweet}`, ` <@&${serverData.roles[i].id}>`)

                    msg.channel.send(embed)
                        .then(async m => {
                            await m.react(emojies[1])
                        })
                }
            })
        })
    }