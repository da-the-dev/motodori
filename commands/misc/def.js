const Discord = require('discord.js')
const utl = require('../../utility')
const { getConnection, DBServer } = utl.db
module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .def
    */
    async (args, msg, client) => {
        if(msg.author.id == process.env.MYID || msg.author.id == process.env.VICID) {
            const server = await new DBServer(msg.guild.id, getConnection())

            server.def = !server.def
            server.save()
            msg.channel.send(utl.embed.def(msg, server.def))
        }
    }