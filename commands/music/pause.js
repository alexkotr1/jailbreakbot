const { Command } = require('discord.js-commando'),
        config = require("../../config"),
        essentials = require("../../music_exports").modules

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'pause',
            group: 'music',
            memberName: 'pause',
            description: 'Pauses music.',
            guildOnly: true,
            examples: ['!pause']
        });
    }
    hasPermission(msg) {
        return msg.member.roles.exists("id", config.moderator)
    }
    async run(message) {
        await message.delete();
        const queue = essentials.queue.get(message.guild.id)
        queue.playing = false;
        queue.connection.dispatcher.pause();
        return message.reply('Music paused!').then(e=>e.delete(5000));   
     }
}