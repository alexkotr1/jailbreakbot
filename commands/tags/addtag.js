const { Command } = require('discord.js-commando');
const config = require("../../config")
const db = require("../../utilities/db")
module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'addtag',
            group: 'tags',
            memberName: 'addtag',
            description: 'Adds a tag',
			guildOnly: true,
            examples: ['!addtag ping Pong!'],
            args: [
                {
                    key: 'tag_name',
                    prompt: 'Please specify your tag\'s name',
                    type: 'string'
                },
				{
                    key: 'word',
                    prompt: 'Please specify your desired tag',
                    type: 'string'
                }
            ]
        });    
    }
hasPermission(msg) {
        return (msg.member.roles.exists("id", config.moderator) || msg.member.roles.exists("id",config.sub_mods))
    }
	
   async run(msg, {tag_name,word}) {
msg.delete().catch(console.error).then(e=>e.delete(3000));
const exists = await db.hexists("tags",tag_name)
if (exists) return msg.reply("This tag already exists.").then(e=>e.delete(3000))
await db.hmset("tags",tag_name,word)
return msg.reply("Tag was added successfully!").then(e=>e.delete(3000))
};
}
