const { Command } = require('discord.js-commando'),
        config = require("../../config"),
        db = require("../../utilities/db").db,
      { RichEmbed } = require('discord.js')
module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'memelist',
            group: 'memes',
            memberName: 'memelist',
            description: 'Deletes a meme from the database',
            examples: ['!memelist']
        });    
    }
hasPermission(msg) {
        return (msg.member.roles.exists("id",config.moderator) || (msg.member.roles.exists("id",config.genius) && msg.channel.id === config.g_backroom))
    }
    async run(msg) {
msg.delete().catch(console.error);
const res = await db.hgetall("memes")
if (!res) return msg.reply("I couldn't find any memes.").then(e=>e.delete(3000))
const embed = new RichEmbed()
.setFooter(`Requested by ${msg.author.tag} | ${msg.author.id}`)
.setColor(0xB0098C)
.setTimestamp()
var string = ""
for (const x in res){
string += '• ' + x + '\n'
}
embed.addField('Meme list',string);
msg.channel.send({embed});
    }
};