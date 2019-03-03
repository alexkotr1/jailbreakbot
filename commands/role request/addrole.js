const { Command } = require('discord.js-commando'),
        config = require("../../config"),
        db = require("../../utilities/db").db

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'addrole',
            group: 'role request',
            memberName: 'addrole',
            description: 'Adds a role in requestable roles.',
            examples: ['!addrole 535233057985265692 355174844205367317 Apple Event\nIf you want to be notified for the upcoming apple event react with <emoji> '],
            args: [
                {
                    key: 'emoji',
                    prompt: 'Insert emoji id.',
                    type: 'string'
                },
				{
                    key: 'role',
                    prompt: 'Insert the requestable role.',
                    type: 'role'
                },
				{
                    key: 'type',
                    prompt: 'Jailbreak/firmware or other update',
                    type: 'string',
                    validate: key => key === 'jailbreak' || key  === 'jb' || key === 'firmware' || key === 'other'
                },
				{
                    key: 'text',
                    prompt: 'Text that will be added in the embed',
                    type: 'string',
                }
            ]
        });    
    }
hasPermission(msg) {
        return msg.member.roles.exists("id",config.moderator)
    }
    async run(msg, {emoji,role,type,text}) {
await message.delete();
const staff_server = msg.client.guilds.get(config.staff_server)
emoji  = staff_server.emojis.get(emoji) ? staff_server.emojis.get(emoji) : emoji
const db_string = (type === 'jailbreak' || type === 'jb') ? 'jailbreak_updates' : type === 'firmware' ? 'firmware_updates' : 'other_updates'
const number = parseInt(await db.get(db_string + '_length'))
await db.incr(db_string + '_length')
await db.hmset(`${db_string}${isNaN(number) ? 0 : number.toString()}`,'role',role.id,'emoji',emoji.id,'text',text)
await msg.reply("Saved new requestable role!").then(e=>e.delete(3000))
}
};