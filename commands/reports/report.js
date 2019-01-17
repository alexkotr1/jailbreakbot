const { Command } = require('discord.js-commando');
const Discord = require("discord.js");
const config = require("../../config")
const db = require("../../utilities/db")

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'report',
            group: 'reports',
            memberName: 'report',
            description: 'Choose when you want to be pinged in reports channel.',
			guildOnly: true,
            examples: ['!report']
        });    
    }
hasPermission(msg) {
        return msg.member.roles.exists("id", config.administrator)
    }

    run(message) {
		message.delete(); 
        const embed = new Discord.RichEmbed()
        .setTitle("Hello! You can choose below when you want to be pinged in the reports channel!")
        .addField("1.", `If you don't want to be pinged in the reports channel react with 1️⃣`)
        .addField("2.", `If you want to be pinged when you are online react with 2️⃣`)
        .addField("3.",`If you always want to be pinged react with 3️⃣`)
        .setTimestamp()
        .setColor(0x9B59B6)
        message.channel.send({embed}).then(async msg=>{
            const emoji_1 = '1⃣'
            const emoji_2 = '2⃣'
            const emoji_3 = '3⃣'
            await msg.react(emoji_1)
            await msg.react(emoji_2)
            await msg.react(emoji_3)
            await db.hmset("ping_preferences_options","channel",msg.channel.id,"message",msg.id)
            const filter = (reaction,user) => reaction._emoji.name === emoji_1 && user.id !== msg.author.id 
            const filter2 = (reaction,user) => reaction._emoji.name === emoji_2 && user.id !== msg.author.id 
            const filter3 = (reaction,user) => reaction._emoji.name === emoji_3 && user.id !== msg.author.id 

            const collector = msg.createReactionCollector(filter);
            const collector2 = msg.createReactionCollector(filter2);
            const collector3 = msg.createReactionCollector(filter3);

            collector.on("collect", async r=>{
                const reactor = r.users.filter(user=>!user.bot).array()[0]
                await db.hset("mods_ping_preferences",reactor.id,0)
                r.remove(reactor)  
            });
            collector2.on("collect", async r=>{
                const reactor = r.users.filter(user=>!user.bot).array()[0]
                await db.hset("mods_ping_preferences",reactor.id,1)
                r.remove(reactor)  
            });
            collector3.on("collect", async r=>{
                const reactor = r.users.filter(user=>!user.bot).array()[0]
                await db.hset("mods_ping_preferences",reactor.id,2)
                r.remove(reactor)  
            });
            
        })
    }
};