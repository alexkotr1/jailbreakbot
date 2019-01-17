const { Command } = require('discord.js-commando');
const config = require("../../config")

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'say',
            group: 'announcements',
            memberName: 'say',
            description: 'Say something in a channel of your choice.',
            examples: ['!say general Hello'],
			guildOnly: true,
            args: [
                {
                    key: 'channel',
                    prompt: 'Where should I send the message?',
                    type: 'channel'
                },
				{
                    key: 'text',
                    prompt: 'What would you like the bot to say?',
                    type: 'string'
                }
            ]
        });
    }
hasPermission(message) {
        return (message.member.roles.exists("id", config.administrator) || msg.author.id == config.owner);
    }
	
	run(message,{channel,text}) {
        message.delete().catch(console.error)
        channel.send(text).catch(console.error)
        return undefined
	}
};

    


