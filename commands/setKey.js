const Discord = require('discord.js')
const redis = require('redis')
module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .setKey <key> <data>
    */
    (args, msg, client) => {
        if(msg.author.id == process.env.MYID) {
            var key = args[1]
            args.shift()
            args.shift()

            var data = JSON.parse(args.join(' '))

            const rClient = redis.createClient(process.env.RURL)
            try {
                rClient.set(key, JSON.stringify(data), err => {
                    if(err) console.log(err)
                    console.log(`[DB] Key '${key}' set to ${args.join(' ').length > 10 ? args.join(' ') : args.join(' ').slice(10) + '...'}`)
                })
            } finally {
                rClient.quit()
            }
        }
    }