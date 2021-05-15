const Discord = require('discord.js')
const redis = require('redis')
const constants = require('../constants.json')
const utl = require('../utility')
const sMsg = 'Картинки'

/**
 * Buys the pic role for some time
 * @param {Discord.Message} msg - OG message
 * @param {Discord.GuildMember} member - Member who bought it
 * @param {number} duration - Duration in seconds
 * @param {number} price - Price
 */
const buyRole = async (msg, member, duration, price) => {
    const rClient = redis.createClient(process.env.RURL)
    const get = require('util').promisify(rClient.get).bind(rClient)
    const set = require('util').promisify(rClient.set).bind(rClient)
    const expire = require('util').promisify(rClient.expire).bind(rClient)
    const ttl = require('util').promisify(rClient.ttl).bind(rClient)
}

module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .picrm
    */
    (args, msg, client) => {
        const rClient = redis.createClient(process.env.RURL)
        const ttl = require('util').promisify(rClient.ttl).bind(rClient)

        ttl('pics-' + msg.author.id).then(res => {
            if(res)
                utl.embed(msg, sMsg, `До окончания действия роли <@&${constants.roles.pics}> осталось ${utl.time.timeCalculator(Math.floor(res / 60))}`)
            else
                utl.embed(msg, sMsg, `У Вас не куплена роль <@&${constants.roles.pics}>`)
            rClient.quit()
        })
    }