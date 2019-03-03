const { Command } = require('discord.js-commando'),
        config = require("../../config"),
        handler = require("../../functions/punishmentHandler")

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'mute',
            group: 'mod utilities',
            memberName: 'mute',
            description: 'Mutes a member for the amount of time it was specified\nContributions by @oliver#9880.',
            examples: ['!mute @AlexK#1337 10m spam'],
            args: [
                {
                    key: 'member',
                    prompt: 'Please provide a member to mute.',
                    type: 'member'
                }, 
				{
                    key: 'timer',
                    prompt: 'Please provide the desired duration of the mute',
                    type: 'string',
                },
				{
                    key: 'reason',
                    prompt: 'Please provide reason of the mute',
                    type: 'string',
					default: 'No reason specified'
                }
            ]
        });    
    }
hasPermission(message) {
        return (message.member.roles.exists("id", config.moderator));
    }
	
    async run(message, {member,timer,reason}) {
handler(message,member,reason,'mute',timer)
}
};
