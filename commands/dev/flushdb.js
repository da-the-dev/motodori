const Discord = require('discord.js')
const redis = require('redis')
module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .flushdb
    */
    (args, msg, client) => {
        if(msg.author.id == process.env.MYID) {
            const rClient = redis.createClient(process.env.RURL)
            rClient.flushdb(err => {
                if(err) console.log(err)
                console.log('!!!DATABASE FLUSHED!!!')
            })
        }

    }