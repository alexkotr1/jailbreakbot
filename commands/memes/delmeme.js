const { Command } = require('discord.js-commando');
const config = require("../../config")
const db = require("../../utilities/db")

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'delmeme',
            group: 'memes',
            memberName: 'delmeme',
            description: 'Deletes a meme from the database',
            examples: ['!delmeme report'],
            args: [
                {
                    key: 'name',
                    prompt: 'Enter a name',
                    type: 'string'
                }
            ]
        });    
    }
hasPermission(msg) {
 return msg.member.roles.exists("id",config.moderator)
    }
async run(message, {name}) {
message.delete().catch(console.error);
const exists = await db.exists("memes")
if (!exists) return message.reply("This meme doesn't exist.")
await db.hdel("memes",name)
return message.reply(`\`\`${name}\`\` was successfully deleted from the database`).then(e=>e.delete(3000))
    }
};