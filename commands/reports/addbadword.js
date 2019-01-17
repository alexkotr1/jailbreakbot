const { Command } = require('discord.js-commando');
const config = require("../../config")
const db = require("../../utilities/db")

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'addbadword',
            group: 'reports',
            memberName: 'addbadword',
            description: 'Adds a bad word in the filter.',
			guildOnly: true,
            examples: ['!addbadword egg 1'],
            args:[
                {
                    key: 'word',
                    prompt: 'Insert word',
                    type: 'string',
                },
                {
                    key: 'priority',
                    prompt: 'Insert word\'s priority',
                    type: 'integer',
                    validate: key => key >= 0 && key <= 2
                }
            ]
        });    
    }
hasPermission(msg) {
        return msg.member.roles.exists("id",config.administrator)
    }

    run(message,{word,priority}) {
        message.delete().catch(console.error);
        db.hmset('bad_words',word,priority).then(()=>{
            return message.reply("Successfully added bad word in the database.").then(msg=>msg.delete(3000))
        }).catch(err=>{
            return message.reply("Error:\n" + err);
        })
    }
};