const Discord = require('discord.js')
const redis = require('redis')
const constants = require('../constants.json')
const utl = require('../utility')
/**
 * Listens to expired "mute" keys in database and unmutes members accordingly
 * @param {Discord.Client} client
 */
module.exports = (client) => {
    // Unmute muted
    const pub = redis.createClient(process.env.RURL)
    pub.send_command('config', ['set', 'notify-keyspace-events', 'Ex'], SubscribeExpired)
    function SubscribeExpired(e, r) {
        sub = redis.createClient(process.env.RURL)
        const expired_subKey = '__keyevent@0__:expired'
        sub.subscribe(expired_subKey, function() {
            console.log(`[DB] Now listeting to '${expired_subKey}' events`)
            sub.on('message', function(chan, msg) {
                console.log(msg)
                if(msg.startsWith('muted-')) {
                    /**@type {Array<string>} */
                    var data = msg.split('-')
                    data.shift()
                    var guild = client.guilds.cache.last()
                    var member = guild.member(data[0])
                    if(!member) return
                    const rClient = redis.createClient(process.env.RURL)
                    rClient.quit()

                    var embed = new Discord.MessageEmbed()
                        .setTitle(`Снятие мута`)
                        .setDescription(`<@${member.user.id}> был(-а) размьючен(-а)`)
                        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                        .setColor('#2F3136')
                    var channel = guild.channels.cache.get(constants.channels.cmd)
                    channel.send(embed)

                    member ? member.roles.remove(constants.roles.muted) : null
                } else if(msg.startsWith('pics')) {
                    var id = msg.split('-').pop()
                    client.guilds.cache.last().member(id).roles.remove(constants.roles.pics)

                    utl.db.createClient(process.env.MURL).then(db => {
                        db.update(client.guilds.cache.last().id, id, { $unset: { pic: '' } }).then(db.close())
                    })
                }
            })
        })
    }
}