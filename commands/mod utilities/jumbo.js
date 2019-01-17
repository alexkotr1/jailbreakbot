const { Command } = require('discord.js-commando');
const config = require("../../config")
module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'jumbo',
            group: 'mod utilities',
            memberName: 'jumbo',
            description: 'Posts given emojis as message attachments.',
            examples: ['!jumbo'],
            args: [{
                key: 'emojis',
                prompt: 'Insert one or more emojis',
                type: 'string',

            }]
        });    
    }
hasPermission(msg) {
return msg.member.roles.exists("id", config.moderator)
    }
	
    run(msg,emojis) {
        msg.delete();
        const regex = /\<a{0,1}\:\w+\:\d+\>/g
        const matches = emojis.emojis.match(regex)
        if (!matches.length) return msg.reply("I couldn't find any emojis.").then(e=>e.delete(3000))
        for(var e =0;e<matches.length;e++){
            const is_animation = matches[e].charAt(1) === 'a'
            matches[e] = `https://cdn.discordapp.com/emojis/${matches[e].substring(matches[e].length - 19,matches[e].length-1)}${is_animation ? '.gif' : '.png'}`
            }
            msg.channel.send({
                files : matches
              })
        

};
}
