const {
    Command
} = require('discord.js-commando');
const config = require("../../config");
const essentials = require("../../music_exports").modules
module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'resume',
            group: 'music',
            memberName: 'resume',
            description: 'Resumes music.',
            guildOnly: true,
            examples: ['!resume']
        });
    }
    hasPermission(msg) {
        return msg.member.roles.exists("id", config.moderator)
    }
    async run(message) {
        message.delete().catch(console.error);
        const queue = essentials.queue.get(message.guild.id)
        if (queue && !queue.playing) {
			queue.playing = true;
			queue.connection.dispatcher.resume();
			return message.reply('Music resumed!').then(e=>e.delete(5000));
		}
		return message.reply('Nothing is playing right now!').then(e=>e.delete(10000));
        
    }
}