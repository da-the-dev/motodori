const Discord = require('discord.js')
/**
 * Fetches reactions to cache
 * @param {Discord.MessageReaction} reaction - Reaction that caused the fetching
 */
module.exports.fetchReactions = async (reaction) => {
    if(reaction.partial) {
        try {
            await reaction.fetch()
        } catch(error) {
            console.error('Something went wrong when fetching the message: ', error)
            return
        }
    }
}