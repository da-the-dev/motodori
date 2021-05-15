const Discord = require('discord.js')
const redis = require('redis')
module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .getKey <key> 
    */
    (args, msg, client) => {
        if(msg.author.id == process.env.MYID) {
            const rClient = redis.createClient(process.env.RURL)
            try {
                rClient.get(args[1], (err, reply) => {
                    console.log('[DB] Getting key...')
                    if(err) {
                        console.log(err)
                        return
                    }
                    if(reply) {
                        console.log(reply)
                    } else {
                        console.log(`[DB] No data about ${args[1]} found!`)
                    }
                })
            } finally {
                rClient.quit()
            }
        }
    }