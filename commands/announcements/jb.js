const { Command } = require('discord.js-commando');
const config = require("../../config")

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'jb',
            group: 'announcements',
            memberName: 'jb',
            description: 'Announce jailbreak updates',
            examples: ['!jb g0blin https://twitter.com/coolstarorg/status/961770596219539456.'],
			guildOnly: true,
            args: [
                {
                    key: 'jb',
                    prompt: 'Which role should I ping?',
                    type: 'string'
                },
                {
                    key: 'tweet',
                    prompt: "Insert the link for the jailbreak's tweet.",
                    type: 'string'
                }
            ]
        });    
    }
hasPermission(msg) {
        return (msg.member.roles.exists("id", config.administrator));
    }
    run(msg, { jb, tweet}) {
        msg.delete().catch(console.error);
        const role = message.guild.roles.find("name",jb)
        if (!role) return message.reply("I couldn't find the jailbreak's role.").then(e=>e.delete(3000));
        const announcements = message.guild.channels.get(config.announcements)
        if (!announcements) return message.reply("I couldn't find the announcements channel.").then(e=>e.delete(3000));
        role.setMentionable(true).then(()=>{
            announcements.send(`${role} ${tweet}`)
        }).then(()=>{
            role.setMentionable(false)
        })
        return message.reply("Success!").then(e=>e.delete(3000));

		
    }
};