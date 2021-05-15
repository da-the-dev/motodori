const Discord = require('discord.js')
const utl = require('../utility')
const sMsg = 'Инвентарь'
module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .inv
    */
    (args, msg, client) => {
        utl.db.createClient(process.env.MURL).then(async db => {
            var userData = await db.get(msg.guild.id, msg.author.id)
            if(userData) {
                if((!userData.inv || userData.inv.length <= 0) && (!userData.customInv || userData.customInv.length <= 0)) {
                    utl.embed.ping(msg, 'к сожалению, Ваш инвентарь пуст')
                    db.close()
                    return
                }
                var embed = utl.embed.build(msg, sMsg, '')

                if(userData.inv && userData.inv.length > 0) {
                    var roles = ''
                    for(i = 0; i < userData.inv.length; i++)
                        if(msg.member.roles.cache.has(userData.inv[i]))
                            roles += `\`${i + 1}.\` <@&${userData.inv[i]}> — надета\n`
                        else
                            roles += `\`${i + 1}.\` <@&${userData.inv[i]}> — снята\n`

                    embed.addField('Магазинные роли', roles)
                }
                if(userData.customInv && userData.customInv.length > 0) {
                    var roles = ''
                    for(i = 0; i < userData.customInv.length; i++)
                        if(msg.guild.roles.cache.get(userData.customInv[i]))
                            if(msg.member.roles.cache.has(userData.customInv[i]))
                                roles += `\`c${i + 1}.\` <@&${userData.customInv[i]}> — надета\n`
                            else
                                roles += `\`c${i + 1}.\` <@&${userData.customInv[i]}> — снята\n`
                        else
                            userData.customInv.splice(userData.customInv.findIndex(id => id == userData.customInv[i]), 1)
                    roles.length > 0 ? embed.addField('Кастомные роли', roles) : null
                    await db.set(msg.guild.id, msg.author.id, userData).then(() => db.close())
                }

                msg.channel.send(embed)
                db.close()
            } else {
                utl.embed.ping(msg, sMsg, 'к сожалению, Ваш инвентарь пуст')
                db.close()
            }
        })
    }