const Discord = require('discord.js')
const utl = require('../utility')
const { DBUser, getConnection } = utl.db
const sMsg = 'Инвентарь'
module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .inv
    */
    async (args, msg, client) => {

        const user = await new DBUser(msg.guild.id, msg.author.id, getConnection())

        if(!user.inv && !user.customInv) {
            utl.embed.ping(msg, sMsg, 'к сожалению, Ваш инвентарь пуст')

            return
        }

        var invChanged = false
        var customInvChanged = false

        console.log(user.inv)
        // if(user.inv)
        //     user.inv.forEach(r => {
        //         if(!msg.guild.roles.cache.has(r.id)) {
        //             invChanged = true
        //             user.inv.splice(user.inv.findIndex(id => id == user.inv[i]), 1)
        //         }
        //     })
        // if(user.customInv)
        //     user.customInv.forEach(r => {
        //         if(!msg.guild.roles.cache.has(r.id)) {
        //             customInvChanged = true
        //             user.customInv.splice(user.customInv.findIndex(id => id == user.customInv[i]), 1)
        //         }
        //     })

        console.log(user.inv)

        if(invChanged || customInvChanged)
            await user.save()


        var embed = utl.embed.build(msg, sMsg, '')

        if(user.inv) {
            var roles = ''
            for(i = 0; i < user.inv.length; i++)
                if(msg.member.roles.cache.has(user.inv[i]))
                    roles += `\`${i + 1}.\` <@&${user.inv[i]}> — надета\n`
                else
                    roles += `\`${i + 1}.\` <@&${user.inv[i]}> — снята\n`

            embed.addField('Магазинные роли', roles)
        }
        if(user.customInv) {
            var roles = ''
            for(i = 0; i < user.customInv.length; i++)
                if(msg.member.roles.cache.has(user.customInv[i]))
                    roles += `\`c${i + 1}.\` <@&${user.customInv[i]}> — надета\n`
                else
                    roles += `\`c${i + 1}.\` <@&${user.customInv[i]}> — снята\n`
            embed.addField('Кастомные роли', roles)
        }

        msg.channel.send(embed)
    }