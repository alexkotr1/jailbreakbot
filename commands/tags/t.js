const { Command } = require('discord.js-commando');
const db = require("../../utilities/db")
module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 't',
            group: 'tags',
            memberName: 't',
            description: 'Displays a tag',
			guildOnly: true,
            examples: ['!t piracy'],
            args: [
                {
                    key: 'tag',
                    prompt: 'Provide a tag name.',
                    type: 'string'
                }
            ]
        });    
    }

	
    async run(msg, {tag}) {
msg.delete().catch(console.error);
const tag_content = await db.hget("tags",tag)
if (!tag_content) return msg.reply("I couldn't find this tag.").then(e=>e.delete(3000))
return msg.channel.send(tag_content).catch(console.error)	
};
}
