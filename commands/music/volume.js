const {
    Command
} = require('discord.js-commando');
const config = require("../../config");
const essentials = require("../../music_exports").modules

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'volume',
            group: 'music',
            memberName: 'volume',
            description: 'Sets or shows music volume.',
            guildOnly: true,
            examples: ['!volume', '!volume 100'],
            args: [{
                key: 'volume',
                prompt: 'Enter your desired volume.',
                type: 'integer',
                default: ''
            }]
        });
    }
    hasPermission(message) {
        return message.member.roles.exists("id", config.moderator) || message.channel.id === config.b_commands
    }
    async run(message, {volume}) {
        message.delete().catch(console.error);
        const serverQueue = essentials.queue.get(message.guild.id)
        if ((volume > 200 || volume < 0) && !message.member.roles.exists("id", config.administrator)) return message.reply("Volume can only get values between 0 and 200.").then(e => e.delete(3000));
        if (!message.member.voiceChannel) return message.reply('You are not in a voice channel!').then(e => e.delete(3000));
        if (!serverQueue) return message.reply('Nothing is playing right now!').then(e => e.delete(10000));
        if (!volume || volume === '') return message.reply(`Current volume is set to: **${serverQueue.volume}**`).then(e => e.delete(10000));
        serverQueue.volume = volume
        serverQueue.connection.dispatcher.setVolume(volume / 100);
        return message.reply(`Volume set to: **${volume}**`).then(e => e.delete(5000));
    }
}