const Discord = require('discord.js')
const constants = require('../../constants.json')
const { sweet } = constants.emojies
const utl = require('../../utility')
const { DBUser, getConnection } = utl.db
const sMsg = 'Временные награды'
module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .timely
    */
    async (args, msg, client) => {
        const user = await new DBUser(msg.guild.id, msg.author.id)

        console.log(user.rewardTimestamp)

        if(user.rewardTimestamp) { // Check if user can collect the reward
            var diff = Math.floor((msg.createdTimestamp - user.rewardTimestamp) / 1000)
            if(diff >= 12 * 60 * 60) { // If 12+ hours passed since last reward collection
                if(diff < 24 * 60 * 60 * 1000) { // And less than 24 
                    var reward = 20 + user.streak * 10
                    user.money += reward
                    user.streak += 1

                    if(user.streak = 14)
                        user.streak = 1

                    user.rewardTimestamp = msg.createdTimestamp
                    await user.save()

                    utl.embed(msg, sMsg, `<@${msg.author.id}>, вы забрали свои **${reward}** ${sweet}. Приходите через **12** часов`)
                } else {
                    var reward = 20 + user.streak * 10
                    user.money += reward
                    user.rewardTimestamp = msg.createdTimestamp
                    await user.save()

                    utl.embed(msg, sMsg, `<@${msg.author.id}>, вы пришли слишком поздно! Вы получаете **${reward}** ${sweet}`)
                }
            } else {
                var time = 12 * 60 - Math.floor(((msg.createdAt - user.rewardTimestamp) / 1000) / 60)

                utl.embed(msg, sMsg, `<@${msg.author.id}>, вы пришли слишком рано! Приходите через ${utl.time.timeCalculator(time)}`)
            }
        } else { // If user never used .timely, but has some data
            user.rewardTimestamp = msg.createdTimestamp
            user.streak = 1
            user.money ? user.money += 20 : user.money = 20

            console.log(user.rewardTimestamp)
            await user.save()

            utl.embed(msg, sMsg, `<@${msg.author.id}>, вы забрали свои **20** ${constants.emojies.sweet}`)
        }
    }