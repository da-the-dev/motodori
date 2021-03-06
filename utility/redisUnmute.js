const Discord = require('discord.js')
const redis = require('redis')
const constants = require('../constants.json')
const utl = require('../utility')
/**
 * Listens to expired "mute" keys in database and unmutes members accordingly
 *
 * @param {Discord.Client} client
 */
module.exports = (client) => {
    // Unmute muted
    const pub = redis.createClient(process.env.RURL)
    pub.send_command('config', ['set', 'notify-keyspace-events', 'Ex'], SubscribeExpired)


    function SubscribeExpired(e, r) {
        const sub = redis.createClient(process.env.RURL)
        const expired_subKey = '__keyevent@0__:expired'
        sub.subscribe(expired_subKey, function() {
            console.log(`[DB] Now listeting to '${expired_subKey}' events`)
            sub.on('message', async function(chan, msg) {
                console.log(msg)
                if(msg.startsWith('mute-')) {
                    /**@type {Array<string>} */
                    const data = msg.split('-')
                    data.shift()
                    const member = client.guild.member(data[0])
                    if(!member) return

                    const user = await new utl.db.DBUser(member.guild.id, member.id)
                    user.mute = false
                    user.save()

                    member ? member.roles.remove(constants.roles.muted) : null

                    const embed = new Discord.MessageEmbed()
                        .setTitle(`Снятие мута`)
                        .setDescription(`<@${member.user.id}> был(-а) размьючен(-а)`)
                        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                        .setColor('#2F3136')
                    const channel = client.guild.channels.cache.get(constants.channels.cmd)
                    channel.send(embed)
                } else if(msg == 'lotery') {
                    utl.lotery.generate(client.guild)
                }
            })
        })
    }
}