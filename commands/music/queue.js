const { Command } = require('discord.js-commando'),
        config = require("../../config"),
        essentials = require("../../music_exports").modules,
      { RichEmbed } = require("discord.js");
module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'queue',
            group: 'music',
            memberName: 'queue',
            description: 'Posts songs queue.',
            guildOnly: true,
            examples: ['!queue']
        });
    }
    hasPermission(message) {
        return message.member.roles.exists("id", config.moderator) || message.channel.id === config.b_commands
    }
    async run(message) {
        await message.delete();
        const serverQueue = essentials.queue.get(message.guild.id)
        if (!serverQueue) return message.reply('Nothing is playing right now!').then(e => e.delete(10000));
        const embed = new RichEmbed()
            .setTitle("Song Queue")
            .setTimestamp()
            .setFooter(`Requested by ${message.author.tag} | ${message.author.id}`)
            .setColor(0xBB098A)
        for (var x = 0; x < serverQueue.songs.length; x++) {
            embed.addField(`${x + 1}.`, `[${serverQueue.songs[x].title}](${serverQueue.songs[x].url})`);
        }
        message.channel.send({embed}).catch(console.error);
    }
}