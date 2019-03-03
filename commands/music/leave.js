const { Command } = require('discord.js-commando'),
        config = require("../../config"),
        essentials = require("../../music_exports").modules

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'leave',
            group: 'music',
            memberName: 'leave',
            description: 'Leaves voice channel.',
            guildOnly: true,
            examples: ['!leave']
        });
    }
    hasPermission(message) {
        return message.member.roles.exists("id", config.moderator)
    }
    async run(message) {
        await message.delete();
        const serverQueue = essentials.queue.get(message.guild.id)
        if (!serverQueue || !serverQueue.voiceChannel) return message.reply("Nothing is playing right now!")
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end('Stop command has been used!');
        serverQueue.voiceChannel.leave();
        essentials.queue.delete(message.guild.id);
        return undefined
    }
}