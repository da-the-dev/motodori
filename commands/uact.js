const Discord = require('discord.js')
const utl = require('../utility')
const constants = require('../constants.json')
const sMsg = 'Активность'
module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .uact
    */
    (args, msg, client) => {
        utl.db.createClient(process.env.MURL).then(db => {
            db.update(msg.guild.id, msg.author.id, [{ $set: { notActivity: { $not: "$notActivity" } } }])
                .then(() => {
                    db.get(msg.guild.id, msg.author.id).then(userData => {
                        utl.embed(msg, sMsg, `Вы успешно ${userData.notActivity ? '**отключили**' : '**включили**'} роли за активность на сервере`)
                        userData.notActivity ? msg.member.roles.remove([constants.roles.daylyActive, constants.roles.nightActive]) : null
                        db.close()
                    })
                })
        })
    }