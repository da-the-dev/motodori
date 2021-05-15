const Discord = require('discord.js')
const utl = require('../utility')
const constants = require('../constants.json')
const sMsg = 'Игровые роли'
module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .ugrole
    */

    //!!!GAMEROLES TRUE - DONT GIVE ROLE; GAMEROLES FALSE - GIVE ROLES!!!
    (args, msg, client) => {
        utl.db.createClient(process.env.MURL).then(db => {
            db.update(msg.guild.id, msg.author.id, [{ $set: { gameRoles: { $not: "$gameRoles" } } }])
                .then(() => {
                    db.get(msg.guild.id, msg.author.id).then(userData => {
                        utl.embed(msg, sMsg, `Вы успешно ${!userData.gameRoles ? '**включили**' : '**отключили**'} роли за игровую активность`)
                        userData.gameRoles ? msg.member.roles.remove(constants.gameRolesArray) : null
                        db.close()
                    })
                })
        })
    }