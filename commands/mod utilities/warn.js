const { Command } = require('discord.js-commando');
        config = require("../../config"),
        handler = require("../../functions/punishmentHandler")

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'warn',
            group: 'mod utilities',
            memberName: 'warn',
            description: 'Warns a member with a specific amount of points.',
            examples: ['!warn @AlexK#1337 100 piracy'],
            args: [
                {
                    key: 'member',
                    prompt: 'Provide a member to warn',
                    type: 'member'
                }, 
				{
                    key: 'points',
                    prompt: 'Provide the desired amount of points for the warn',
                    type: 'integer',
                },
				{
                    key: 'reason',
                    prompt: 'Provide reason of the warn',
                    type: 'string'
                }
            ]
        });    
    }
hasPermission(message) {
        return message.member.roles.exists("id", config.moderator);
    }
	
   async run(message, {member,points,reason}) {
handler(message,member,reason,'warn',points)
}
};
