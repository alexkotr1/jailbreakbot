const { Command } = require('discord.js-commando'),
        config = require("../../config"),
        db = require("../../utilities/db").xpdb

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'xpaddpro',
            group: 'levelling',
            memberName: 'xpaddpro',
            description: 'Adds a role in the roles that can be earned via experience points.',
            guildOnly: true,
            examples: ['!xpaddpro 30 Member Pro'],
            args: [{
                    key: 'level',
                    prompt: 'Enter a level.',
                    type: 'integer',
                },
                {
                    key: 'role',
                    prompt: 'Enter a role.',
                    type: 'role',
                }
            ]
        });
    }
    hasPermission(msg) {
        return msg.member.roles.exists("id", config.administrator)
    }
    async run(message, {level,role}) {
        message.delete().catch(console.error);
        await db.hset("XP_ROLES", level, role.id)
        return message.reply(`Successsfully added ${role.name} in the database.`).then(e => e.delete(3000))
    }
}