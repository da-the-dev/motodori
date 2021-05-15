const Discord = require('discord.js')
const utl = require('../utility')
module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .def
    */
    (args, msg, client) => {
        if(msg.author.id == process.env.MYID || msg.author.id == process.env.SERID) {
            utl.db.createClient(process.env.MURL).then(db => {
                db.get(msg.guild.id, 'serverSettings').then(serverData => {
                    console.log(serverData)
                    if(serverData) {
                        db.update(msg.guild.id, 'serverSettings', { $set: { def: !serverData.def } }).then(() => db.close())
                        msg.channel.send(utl.embed.def(msg, !serverData.def))
                    }
                    else {
                        db.update(msg.guild.id, 'serverSettings', { $set: { def: true } }).then(() => db.close())
                        msg.channel.send(utl.embed.def(msg, true))
                        console.log('def')
                    }
                })
            })
        }
    }