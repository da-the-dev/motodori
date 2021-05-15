const Discord = require('discord.js')
const utl = require('../utility')
const constants = require('../constants.json')
const schedule = require('node-schedule')

/**
 * Monitors when a loveroom member left the server
 * @param {Discord.GuildMember} member 
 */
module.exports.roomDeletion = async (member) => {
    if(member.roles.cache.has(constants.roles.loveroom)) {
        console.log('valid loveroom deletion')
        utl.db.createClient(process.env.MURL).then(db => {
            db.get(member.guild.id, member.id).then(userData => {
                if(userData) {
                    var partnerID = userData.loveroom.partner
                    var id = userData.loveroom.id
                    member.guild.channels.cache.get(id).delete()
                    delete userData.loveroom
                    db.set(member.guild.id, member.id, userData).then(() => {
                        member.guild.member(partnerID).roles.remove(constants.roles.loveroom)

                        db.get(member.guild.id, partnerID).then(partnerData => {
                            if(partnerData) {
                                delete partnerData.loveroom
                                db.set(member.guild.id, partnerID, partnerData).then(() => {
                                    db.close()
                                })
                            }
                        })
                    })
                }
            })
        })
    }
}

/**
 * 
 * @param {Discord.Guild} guild
 */
const payment = (guild) => {
    utl.db.createClient(process.env.MURL).then(db => {
        db.updateMany('718537792195657798', { loveroom: { $exists: true } }, { $inc: { 'loveroom.bal': -3000 } })
            .then(() => {
                db.getMany('718537792195657798', { loveroom: { $exists: true } }).then(async data => {
                    for(i = 0; i < data.length; i++) {
                        if(data[i].loveroom.bal <= 0) {
                            var channel = guild.channels.cache.get(data[i].loveroom.id)
                            channel ? channel.delete() : null
                            guild.member(data[i].id).roles.remove(constants.roles.loveroom)

                            await db.update('718537792195657798', data[i].id, { $unset: { 'loveroom': '' } })
                        }
                    }
                    db.close()
                })
            })
    })
}

/**
 *
 * @param {Discord.Client} client
 */
module.exports.initPayment = (client) => {
    schedule.scheduleJob('0 0 1 * *', () => {
        payment(client.guilds.cache.first())
    })
    schedule.scheduleJob('0 0 12 * *', () => {
        payment(client.guilds.cache.first())
    })
    schedule.scheduleJob('0 0 24 * *', () => {
        payment(client.guilds.cache.first())
    })
}