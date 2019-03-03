const { Command } = require('discord.js-commando'),
        config = require("../../config"),
        db = require("../../utilities/db").db

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

   async run(message,{word,priority}) {
        await message.delete();
        db.hmset('bad_words',word,priority).then(()=>{
            return message.reply("Successfully added bad word in the database.").then(msg=>msg.delete(3000))
        }).catch(err=>{
            return message.reply("Error:\n" + err);
        })
    }
};