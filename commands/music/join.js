const { Command } = require('discord.js-commando');

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'join',
            group: 'music',
            memberName: 'join',
            description: 'Joins voice channel.',
            guildOnly: true,
            examples: ['!join']
        });
    }

    async run(message) {
        await message.delete();
        const vc = message.member.voiceChannel
        if (!vc) return message.reply("You are not in a voice channel!").then(e=>e.delete(3000))
        return vc.join()
    }
}