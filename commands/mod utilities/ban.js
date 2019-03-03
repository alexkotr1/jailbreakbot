const { Command } = require('discord.js-commando'),
        config = require("../../config"),
        handler = require("../../functions/punishmentHandler")

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'ban',
            group: 'mod utilities',
            memberName: 'ban',
            description: 'Bans given member.',
            guildOnly: true,
            examples: ['!ban @AlexK#1337 NSFW'],
            args: [{
                    key: 'member',
                    prompt: 'Enter a member.',
                    type: 'member',
                },
                {
                    key: 'reason',
                    prompt: 'Enter a reason.',
                    type: 'string',
                    default: 'No reason specified.'
                }
            ]
        });
    }
    hasPermission(message) {
        return message.member.roles.exists("id", config.moderator) || message.channel.id === config.b_commands
    }
    async run(message, {member, reason}) {
        handler(message, member, reason, 'ban')
    }
}