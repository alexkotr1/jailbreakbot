const { Command } = require('discord.js-commando'),
        db = require("../../utilities/db").db

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

	
    async run(message, {tag}) {
await message.delete();
const tag_content = await db.hget("tags",tag)
if (!tag_content) return message.reply("I couldn't find this tag.").then(e=>e.delete(3000))
return message.channel.send(tag_content).catch(console.error)	
};
}
