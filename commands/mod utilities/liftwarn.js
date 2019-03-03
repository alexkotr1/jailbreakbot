const { Command } = require('discord.js-commando'),
        config = require("../../config"),
        handler = require("../../functions/punishmentHandler")

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'liftwarn',
            group: 'mod utilities',
            memberName: 'liftwarn',
            description: 'Removes the amount of warning points it was specified from a member.',
            examples: ['!liftwarn @AlexK#1337 100 resolved the situation'],
            args: [
                {
                    key: 'member',
                    prompt: 'Please provide a member to de-warn',
                    type: 'member'
                }, 
				{
                    key: 'points',
                    prompt: 'Please provide amount of points to de-warn',
                    type: 'integer',
                },
				{
                    key: 'reason',
                    prompt: 'Please provide a reason for the de-warn',
                    type: 'string'
                }
            ]
        });    
    }
hasPermission(message) {
        return (message.member.roles.exists("id", config.moderator));
    }
	
    async run(message, {member,points,reason}) {
handler(message,member,reason,'lift-warn',points)
};
}


