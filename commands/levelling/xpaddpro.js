const { Command } = require('discord.js-commando');
const config = require("../../config");
const redis = require("async-redis");
const db = redis.createClient({
    db: 2
});
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
        message.delete();
        await db.hset("XP_ROLES", level, role.id)
        return message.reply(`Successsfully added ${role.name} in the database.`).then(e => e.delete(3000))
    }
}