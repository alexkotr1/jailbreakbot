const { Command } = require('discord.js-commando'),
        config = require("../../config"),
        essentials = require("../../music_exports").modules,
      { RichEmbed } = require("discord.js")
module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'np',
            group: 'music',
            memberName: 'np',
            description: 'Posts currently playing song info.',
            guildOnly: true,
            examples: ['!np']
        });
    }
    hasPermission(msg) {
        return msg.member.roles.exists("id", config.moderator) || msg.channel.id === config.b_commands
    }
    async run(message) {
        await message.delete();
        const serverQueue = essentials.queue.get(message.guild.id)
        if (!serverQueue) return message.reply('Nothing is playing right now!').then(e => e.delete(10000));
        const embed = new RichEmbed()
            .setColor(0xBB098A)
            .addField("Now Playing", `[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})`)
            .setFooter(`Requested by ${message.author.tag} | ${message.author.id}`)
            .setTimestamp()
        return message.channel.send({embed})
    }
}