const { Command } = require('discord.js-commando'),
        config = require("../../config"),
        essentials = require('../../music_exports').modules,
      { RichEmbed } = require("discord.js");
module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'play',
            group: 'music',
            memberName: 'play',
            description: 'Plays music in voice channels.',
            guildOnly: true,
            examples: ['!play https://www.youtube.com/watch?v=2gzt6GeNLBk&index=15&list=RDhQlPzrX8u0A'],
            args: [{
                key: 'url',
                prompt: 'Please enter a link or song\'s name.',
                type: 'string',
            }]
        });
    }
    hasPermission(message) {
        return message.member.roles.exists("id", config.moderator) || message.channel.id === config.b_commands
    }
    async run(message, {url}) {
        await message.delete();
		const voiceChannel = message.member.voiceChannel;
        if (!voiceChannel) return message.reply('You are not in a voice channel!').then(e=>e.delete(5000));
		if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
			const playlist = await essentials.youtube.getPlaylist(url);
			const videos = await playlist.getVideos();
			for (const video of Object.values(videos)) {
				const video2 = await essentials.youtube.getVideoByID(video.id); 
				await essentials.handleVideo(video2, message, voiceChannel, true); 
			}
			return message.reply(`**${playlist.title}** has been added to the queue!`).then(e=>e.delete(10000));
		} else {
			try {
				var video = await essentials.youtube.getVideo(url);
			} catch (error) {
				try {
					const videos = await essentials.youtube.searchVideos(url, 10);
                     const embed = new RichEmbed()
                     .setTitle("Select a song")
                     .setTimestamp()
                     .setColor(0xBB098A)
                     .setFooter(`Requested by ${message.author.tag} | ${message.author.id}`)
                     for (var x = 0;x<videos.length;x++){
                         embed.addField(`${x + 1}.`,`[${videos[x].title}](${videos[x].url})`)
                     }
					message.channel.send({embed}).catch(console.error);
					try {
						var response = await message.channel.awaitMessages(message2 => message2.content > 0 && message2.content < 11, {
							maxMatches: 1,
							time: 10000,
							errors: ['time']
						});
					} catch (err) {
						console.error(err);
						return message.reply('Invalid value.').then(e=>e.delete(4000));
					}
					const videoIndex = parseInt(response.first().content);
					var video = await essentials.youtube.getVideoByID(videos[videoIndex - 1].id);
				} catch (err) {
					console.error(err);
				}
			}
			return essentials.handleVideo(video, message, voiceChannel);
		}

    }
}