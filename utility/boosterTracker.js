const Discord = require('discord.js')
const redis = require('redis')
const util = require('util')
/**
 * Tracks how many boosts does a member have
 * @param {Discord.GuildMember} oldMember 
 * @param {Discord.GuildMember} newMember 
 */
module.exports = (oldMember, newMember) => {
    // if(newMember.premiumSinceTimestamp != 0 && oldMember.premiumSinceTimestamp != newMember.premiumSinceTimestamp) {
    //     const rClient = require('redis').createClient(process.env.RURL)

    //     const get = util.promisify(rClient.get).bind(rClient)
    //     const set = util.promisify(rClient.set).bind(rClient)

    //     get(newMember.id)
    //         .then(res => {
    //             if(res) {
    //                 var userData = JSON.parse(res)
    //                 userData.boosts ? userData.boosts += 1 : userData.boosts = 1
    //                 set(newMember.id, JSON.stringify(userData))
    //                     .then(() => { console.log(`new boost from ${newMember.displayName}, total boosts: ${userData.boosts}`); rClient.quit() })
    //             } else
    //                 set(newMember.id, JSON.stringify({ boosts: 1 }))
    //                     .then(() => { console.log(`brand new boost from ${newMember.displayName}`); rClient.quit() })
    //         })
    // }


}