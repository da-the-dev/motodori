const Discord = require('discord.js')
const utl = require('../../utility')
const { DBServer } = utl.db
module.exports =
    /**
     * @param {Array<string>} args Command argument
     * @param {Discord.Message} msg Discord message object
     * @param {Discord.Client} client Discord client object
     * @example Usage: .def
     */
    async (args, msg, client) => {
        if(msg.author.id == process.env.MYID || msg.author.id == process.env.VICID) {
            const server = await new DBServer(msg.guild.id)

            server.def = !server.def
            server.save()
            msg.channel.send(utl.embed.def(msg, server.def))
        }
    }