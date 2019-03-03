const { Command } = require('discord.js-commando'),
        config = require("../../config"),
        handler = require("../../functions/punishmentHandler")

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'kick',
            group: 'mod utilities',
            memberName: 'kick',
            description: 'Kicks the given member.',
            examples: ['!kick @AlexK#1337 alt account'],
            args: [
                {
                    key: 'member',
                    prompt: 'Provide a member to kick',
                    type: 'member'
                }, 
				{
                    key: 'reason',
                    prompt: 'Provide reason of the kick',
                    type: 'string',
					default: 'No reason specified'
                }
            ]
        });    
    }
hasPermission(message) {
        return message.member.roles.exists("id", config.moderator);
    }
	
    async run(message, {member,reason}){
        handler(message,member,reason,'kick')
    }
}
