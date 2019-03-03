const { Command } = require('discord.js-commando'),
        config = require("../../config"),
        db = require("../../utilities/db").db

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'deltag',
            group: 'tags',
            memberName: 'deltag',
            description: 'Removes a tag',
			guildOnly: true,
            examples: ['!deltag piracy'],
            args: [
                {
                    key: 'tag_name',
                    prompt: 'Which tag do you want to remove?',
                    type: 'string'
                }
            ]
        });    
    }
hasPermission(msg) {
        return (msg.member.roles.exists("id", config.moderator) || msg.member.roles.exists("id",config.sub_mods))
    }
	
    async run(msg, {tag_name}) {
await message.delete();
const exists = db.hexists("tags",tag_name)
if (!exists) return msg.reply("I couldn't find this tag.").then(e=>e.delete(3000))
await db.hdel("tags",tag_name)
return msg.reply("Tag was successfully deleted.").then(e=>e.delete(3000))
};
}
