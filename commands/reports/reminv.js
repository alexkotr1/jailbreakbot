const { Command } = require('discord.js-commando');
const config = require("../../config")
const db = require("../../utilities/db")

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'reminv',
            group: 'reports',
            memberName: 'reminv',
            description: 'Removes an invite code from the allowed codes list.',
			guildOnly: true,
            examples: ['!reminv jb'],
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
        return msg.member.roles.exists("id", config.administrator)
    }

   async run(message,{code}) {
        message.delete().catch(console.error);
       const exists = await db.hexists("exempt_invites",code)
       if (!exists) return message.reply(`\`\`${code}\`\` doesn't exist in the database.`).then(e=>e.delete(3000))
       await db.hdel("exempt_invites",code,)
       message.reply(`\`\`${code}\`\` was successfully removed from the database.`).then(e=>e.delete(3000))
    }
};