const { Command } = require('discord.js-commando');
const config = require("../../config")
const db = require("../../utilities/db")

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'removebadword',
            group: 'reports',
            memberName: 'removebadword',
            description: 'Removes a bad word from the filter.',
			guildOnly: true,
            examples: ['!removebadword egg'],
            args:[
                {
                    key: 'word',
                    prompt: 'Insert word',
                    type: 'string',
                }
            ]
        });    
    }
hasPermission(msg) {
        return msg.member.roles.exists("name", "Administrators")
    }

    async run(message,{word}) {
        message.delete().catch(console.error);
        const exists = await db.hexists("bad_words",word)
        if (!exists) return message.reply("This bad word doesn't exist.").then(e=>e.delete(3000))
        await db.hdel("bad_words",word)
        return message.reply("Successfully removed bad word from database.").then(e=>e.delete(3000))
    }
};