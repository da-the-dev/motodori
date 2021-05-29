const { Message, Client } = require('discord.js')
const { db, embed, redisConnection } = require('../../utility')
const { DBUser } = db
const { getRedCon } = redisConnection

/**
 * New mute command
 * @param {string[]} args 
 * @param {Message} msg 
 * @param {Client} client 
 * Usage: .mute <member> 5s 10s 5m reason
 */
module.exports = (args, msg, client) => {
    const mMember = msg.mentions.first
}