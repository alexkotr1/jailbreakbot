const {
    Command
} = require('discord.js-commando');
const redis = require("async-redis");
const db = redis.createClient({
    db: 2
})
module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'freezexp',
            group: 'levelling',
            memberName: 'freezexp',
            description: 'Freezes xp of given member.',
            guildOnly: true,
            examples: ['!freezexp @Aaron#9999'],
            args: [{
                key: 'member',
                prompt: 'Enter a member.',
                type: 'member',
            }]
        });
    }
    hasPermission(msg) {
        return msg.author.id === msg.guild.ownerID
    }
    async run(message, {
        member
    }) {
        message.delete();
        await db.set(member.user.id + '_frozen_xp', 1)
        return message.reply(`Successfully frozen @${member.user.tag}'s xp.`).then(e => e.delete(3000))
    }
}