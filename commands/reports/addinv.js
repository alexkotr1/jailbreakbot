const { Command } = require('discord.js-commando'),
        config = require("../../config"),
        db = require("../../utilities/db").db

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
        return msg.member.roles.exists("id", config.administrator)
    }

    async run(message,{code}) {
       await message.delete();
       const exists = await db.hexists("exempt_invites",code)
       if (exists) return message.reply(`\`\`${code}\`\` is already added in the database.`).then(e=>e.delete(3000))
       await db.hmset("exempt_invites",code,'<TBD>')
       message.reply(`\`\`${code}\`\` was successfully added in the database.`).then(e=>e.delete(3000))
    }
};