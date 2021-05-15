const Discord = require('discord.js')
const utl = require('../utility')
const { scheduleJob } = require("node-schedule")

/**
* Check if the ID is the owner of the role
* @param {string} guildID - ID of the guild
* @param {string} id - ID of the member/user
* @param {string} roleID - ID of the role
* @returns {Promise<true>} True if is the owner, false otherwise
*/
module.exports.checkIfOwner = (guildID, id, roleID) => {
    return new Promise((resolve, reject) => {
        utl.db.createClient(process.env.MURL).then(db => {
            db.getServer(guildID).then(serverData => {

                // Doesnt have custom roles
                if(!serverData.customRoles.find(r => r.owner == id)) {
                    utl.embed(msg, 'У Вас нет кастомных ролей!')
                    db.close()
                    reject(false)
                }

                // Role isn't custom
                if(!serverData.customRoles.find(r => r.id == roleID)) {
                    utl.embed(msg, 'Эта роль не является кастомной!')
                    db.close()
                    reject(false)
                }

                // Role doesn't belong to the user
                if(!serverData.customRoles.find(r => r.id == roleID).owner == id) {
                    utl.embed(msg, 'Эта роль не Ваша!')
                    db.close()
                    reject(false)
                }

                db.close()
                resolve(true)
            })
        })
    })
}

module.exports.findRole

/**
 * Deletes expired roles
 * @param {Discord.Client} client - Bot client
 */
module.exports.deleteExpired = (client) => {
    scheduleJob('0 0 * * *', () => {
        utl.db.createClient(process.env.MURL).then(db => {
            client.guilds.cache.forEach(g => {
                db.get(g.id, 'serverSettings').then(serverData => {
                    serverData.customRoles.forEach(r => {
                        if(Date.now() >= r.expireTimestamp) {
                            g.roles.cache.get(r.id).delete()
                            serverData.customRoles.splice(serverData.customRoles.findIndex(R => R.id == r.id), 1)
                        }
                    })
                })
            })
        })
    })
}