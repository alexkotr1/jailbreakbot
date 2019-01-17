function isUrlValid(userInput) {
    var res = userInput.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    if(res == null)
        return false;
    else
        return true;
}
const { Command } = require('discord.js-commando');
const download = require('images-downloader').images;
const config = require("../../config")
const db = require("../../utilities/db")

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'addmeme',
            group: 'memes',
            memberName: 'addmeme',
            description: 'Adds a meme to the database',
            examples: ['!addmeme text piracy *notices your piracy* \n owo what\'s this?'],
            args: [
                {
                    key: 'selection',
                    prompt: 'Image or text?',
                    type: 'string'
                },
				{
                    key: 'name',
                    prompt: 'Enter a name',
                    type: 'string'
                },
				{
                    key: 'link',
                    prompt: 'Text/Link to image',
                    type: 'string',
                }
            ]
        });    
    }
hasPermission(msg) {
        return msg.member.roles.exists("id",config.moderator)
    }
    async run(msg, {selection,name,link}) {
msg.delete().catch(console.error);
try{
if (selection === 'image'){
if (!isUrlValid(link)) return msg.reply("Error, you provided an invalid url.").then(i=>i.delete(3000));
download([link], './memes/')
.then(async result => {
await db.hmset("memes",name,result[0].filename)
})
.catch(error => console.log("downloaded error", error))
}
else await db.hmset("memes",name,link);
return msg.reply("Meme was successfully added in the database.").then(e=>e.delete(3000))
}
catch(err){
    return msg.reply("Something went wrong.\n" + err).then(e=>e.delete(3000))
}
	}
};