const { Command } = require('discord.js-commando');
const config = require("../../config")
const db = require("../../utilities/db")

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'addinv',
            group: 'reports',
            memberName: 'addinv',
            description: 'Prevents filter from detecting given invite code.',
			guildOnly: true,
            examples: ['!addinv jb'],
            args:[
                {
                    key: 'code',
                    prompt: 'Insert code',
                    type: 'string'
                }
            ]
        });    
    }
hasPermission(msg) {
        return msg.member.roles.exists("name", "Administrators")
    }

    async run(message,{code}) {
        message.delete().catch(console.error);
       const exists = await db.hexists("exempt_invites",code)
       if (exists) return message.reply(`\`\`${code}\`\` is already added in the database.`).then(e=>e.delete(3000))
       await db.hmset("exempt_invites",code,'<TBD>')
       message.reply(`\`\`${code}\`\` was successfully added in the database.`).then(e=>e.delete(3000))
    }
};