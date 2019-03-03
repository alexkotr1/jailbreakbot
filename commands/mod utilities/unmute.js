const { Command } = require('discord.js-commando'),
        config = require("../../config"),
        handler = require("../../functions/punishmentHandler")

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'unmute',
            group: 'mod utilities',
            memberName: 'unmute',
            description: 'Unmutes a member.',
            examples: ['!unmute @AlexK#1337'],
            args: [
                {
                    key: 'member',
                    prompt: 'Please provide a member to unmute.',
                    type: 'member'
                }
            ]
        });    
    }
hasPermission(message) {
        return (message.member.roles.exists("id", config.moderator));
    }
	
    async run(message, {member}) {
handler(message,member,undefined,'unmute')
};
}

