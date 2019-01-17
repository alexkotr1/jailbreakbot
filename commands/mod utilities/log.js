const { Command } = require('discord.js-commando', 'discord.js');
const config = require("../../config")
const db = require("../../utilities/db")
module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'log',
            group: 'mod utilities',
            memberName: 'log',
            description: 'Toggles logging in the channel the command was executed.',
            examples: ['!log purge'],
            args: [
				{
                    key: 'string',
                    prompt: 'Select type of logging to toggle.',
                    type: 'string',
					default:""

                }
            ]
        });
    }
hasPermission(msg) {
        return (msg.author.id === config.owner)
    }
  async run(msg,{string}) {
	  msg.delete().catch(console.error);
if (string === 'purge') {
const res = await db.get(`${msg.channel.id}purge`)
		if (!res){
			db.set(`${msg.channel.id}purge`,1);
			return msg.reply(`Successfully disabled purge logging in ${msg.channel}`).then(e=>e.delete(3000));
		}
		db.del(`${msg.channel.id}purge`);
		return msg.reply(`Successfully enabled purge logging in ${msg.channel}`).then(e=>e.delete(3000));
}
else if (!string || string == '' || string == '*'){
	const res = await db.get(`${msg.channel.id}logging`)
		if (err) return console.error(err);
		if (!res){
			db.set(`${msg.channel.id}logging`,1);
			return msg.reply(`Successfully disabled logging in ${msg.channel}`).then(e=>e.delete(3000));
		}
		db.del(`${msg.channel.id}logging`);
		return msg.reply(`Successfully enabled logging in ${msg.channel}`).then(e=>e.delete(3000));
}
else return msg.reply(`Invalid logging type: ${string}`).then(e=>e.delete(3000));


}

};

    


