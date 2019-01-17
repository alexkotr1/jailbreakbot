const { Command } = require('discord.js-commando', 'discord.js');
const fs = require('fs');
const config = require("../../config")
const db = require("../../utilities/db")
module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'meme',
            group: 'memes',
            memberName: 'meme',
            description: 'Adds a meme to the database',
            examples: ['!meme piracy'],
            args: [
                {
                    key: 'name',
                    prompt: 'Provide meme name',
                    type: 'string'
                }
            ]
        });    
    }
hasPermission(msg) {
        return (msg.member.roles.exists("id",config.moderator) || (msg.member.roles.exists("id",config.genius) && msg.channel.id === config.g_backroom) || (msg.member.roles.exists("id",config.mem_edition) && msg.channel.id === config.general))
    }
    async run(msg, {name}) {
msg.delete().catch(console.error);
const res = await db.hget("memes",name)
if (!res) return msg.reply("I couldn't find this meme.").then(e=>e.delete(3000))
	if (fs.existsSync(res)) {
	msg.channel.send({
  files: [res]
})
  .catch(console.error);
}
else msg.channel.send(res).catch(console.error);
    }
};