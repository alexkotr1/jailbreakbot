const { Command } = require('discord.js-commando'),
        config = require("../../config"),
        essentials = require("../../music_exports").modules

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'skip',
            group: 'music',
            memberName: 'skip',
            description: 'Skips currently playing song in voice channel.',
            guildOnly: true,
            examples: ['!skip']
        });
    }
    hasPermission(message) {
        return message.member.roles.exists("id", config.moderator)
    }
    async run(message) {
        await message.delete();
        if (!message.member.voiceChannel) return message.reply('You are not in a voice channel!').then(e => e.delete(3000));
        const serverQueue = essentials.queue.get(message.guild.id)
        if (!serverQueue) return message.reply('Nothing is playing right now.').then(e => e.delete(10000));
        serverQueue.connection.dispatcher.end('Skip command has been used!');
        return undefined;
    }
}