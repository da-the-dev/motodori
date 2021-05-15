const Discord = require('discord.js')
const utl = require('../utility')
const constants = require('../constants.json')
const { dot } = require('../constants.json').emojies

/**
 * Handles report reactions
 * @param {Discord.MessageReaction} reaction - Reaction
 * @param {Discord.User} user - Reaction's user
 * @param {Discord.Client} client - Bot client
 */
module.exports.reportAssignmentHandler = async (reaction, user, client) => {
    if(reaction.message.channel.id == constants.channels.reports) {
        // Fetch the message
        if(reaction.message.partial)
            try {
                await reaction.message.fetch()
            } catch(err) {
                console.error('error in reportHandler message fetch: ', err)
                return
            }


        // If report is being taken 
        switch(reaction.emoji.name) {
            case "☑️":
                if(user.id != client.user.id) {
                    var reportID = reaction.message.embeds[0].footer.text
                    reportID = Number(reportID.slice(reportID.indexOf('ID: ') + 4, reportID.length))
                    console.log(reportID)

                    utl.db.createClient(process.env.MURL).then(db => {
                        db.get(reaction.message.guild.id, `report-${reportID}`).then(reportInfo => {
                            console.log(reportInfo)
                            db.delete(reaction.message.guild.id, `report-${reportID}`).then(() => db.close())

                            var description = `\n— За жалобу взялся(-ась) <@${user.id}>\n`
                            reportInfo.reportVoiceChannel ? description += `— [Канал пожаловавшегося](${reportInfo.reportVoiceChannel})\n` : null
                            reportInfo.guiltyVoiceChannel ? description += `— [Канал виновника](${reportInfo.guiltyVoiceChannel})` : null

                            const { dot } = require('../constants.json').emojies
                            const takenReport = reaction.message.embeds[0]
                            takenReport.setTitle(`${dot}Жалоба от ${reaction.message.guild.member(reportInfo.caller).user.tag || 'неизвестный'}`)
                            takenReport.setDescription(description)
                            takenReport.addField("Жалоба на", `<@${reportInfo.guilty}>`, true)
                            takenReport.addField("Содержимое жалобы", `${reportInfo.description}`, true)

                            reaction.message.edit(takenReport)
                                .then(m => {
                                    m.reactions.removeAll()
                                        .then(async m => {
                                            await m.react('✅')
                                            await m.react('❌')
                                        })
                                })
                        })
                    })
                }
                break

            // If report closed with success
            case "✅":
                var moderID = reaction.message.embeds[0].description.slice(reaction.message.embeds[0].description.indexOf('<@') + 2, reaction.message.embeds[0].description.indexOf('>'))

                if(user.id != client.user.id && user.id == moderID) {
                    var name = reaction.message.embeds[0].title
                    name = name.slice(name.indexOf('от') + 3)
                    var successEmbed = new Discord.MessageEmbed()
                        .setTitle(`${dot}Вердикт жалобы • ${name}`)
                        .setDescription(`<@${user.id}> закрыл репорт с пометкой **выполнен**`)
                        .setThumbnail(reaction.message.embeds[0].thumbnail.url)
                        .setColor('#2F3136')
                    reaction.message.edit(successEmbed)
                        .then(m => {
                            m.reactions.removeAll()
                        })
                    return
                }
                break

            // If report closed with fail
            case "❌":
                var moderID = reaction.message.embeds[0].description.slice(reaction.message.embeds[0].description.indexOf('<@') + 2, reaction.message.embeds[0].description.indexOf('>'))

                if(user.id != client.user.id && user.id == moderID) {
                    var name = reaction.message.embeds[0].title
                    name = name.slice(name.indexOf('от') + 3)
                    var successEmbed = new Discord.MessageEmbed()
                        .setTitle(`${dot}Вердикт жалобы • ${name}`)
                        .setDescription(`<@${user.id}> закрыл репорт с пометкой **не выполнен**`)
                        .setThumbnail(reaction.message.embeds[0].thumbnail.url)
                        .setColor('#2F3136')
                    reaction.message.edit(successEmbed)
                        .then(m => {
                            m.reactions.removeAll()
                        })
                }
                break
        }
    }
}