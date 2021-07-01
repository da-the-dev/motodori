const Discord = require('discord.js')
const { DBServer } = require('../utility/db')
const { scheduleJob } = require('node-schedule')
/**
 * Deletes expired roles
 *
 * @param { Discord.Client } client - Bot client
 */
module.exports.deleteExpired = (client) => {
    scheduleJob('0 0 * * *', async () => {
        const server = await new DBServer(client.guild.id)
        server.customRoles.forEach(r => {
            if(Date.now() >= r.expireTimestamp) {
                client.guild.roles.cache.get(r.id).delete()
                server.customRoles.splice(server.customRoles.findIndex(R => R.id == r.id), 1)
            }
        })
        server.save()
    })
}