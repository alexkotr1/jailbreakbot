const { Command } = require('discord.js-commando'),
        config = require("../../config"),
        db = require("../../utilities/db").db,
        Discord = require("discord.js")

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'exempt',
            group: 'reports',
            memberName: 'exempt',
            description: 'Adds an exemption in the filter.',
			guildOnly: true,
            examples: ['!exempt role Moderators'],
            args:[
                {
                    key: 'type',
                    prompt: '',
                    type: 'string',
                    validate: key=> key.toLowerCase() === 'role' || key.toLowerCase() === 'channel'
                },
                {
                    key: 'exempt_type',
                    prompt: 'Insert type of exemption',
                    type: 'string',
                    validate: key=> key.toLowerCase() === 'invite' || key.toLowerCase() === 'filter'
                },
                {
                    key: 'ID',
                    prompt: 'Insert ID',
                    type: 'role|channel'                   
                }
            ]
        });    
    }
hasPermission(msg) {
        return msg.member.roles.exists("id", config.administrator)
    }

    async run(message,{type,exempt_type,ID}) {
        await message.delete();
        if ((ID instanceof Discord.Role && type.toLowerCase() === 'channel') || (ID instanceof Discord.GuildChannel && type.toLowerCase() === 'role')) return message.reply("You provided invalid ID.").then(e=>e.delete(3000))
        if (type.toLowerCase() === 'channel'){
            exempt_type = exempt_type === 'invite' ? 'invites_exempted_channels' : 'filter_exempted_channels'
            const exists = await db.hexists(exempt_type,ID.id)
            if (exists){
                await db.hdel(exempt_type,ID.id)
                return message.reply(`${ID} was successfully removed from the exempted channels.`)
            }
            else {
                await db.hmset(exempt_type,ID.id,"<TBD>")
                return message.reply(`${ID} was successfully added in the exempted channels.`)
            }            
        }
        else {
            exempt_type = exempt_type === 'invite' ? 'invites_exempted_roles' : 'filter_exempted_roles'
            const exists = await db.hexists(exempt_type,ID.id)
            if (exists){
                await db.hdel(exempt_type,ID.id)
                return message.reply(`${ID.name} role was successfully removed from the exempted roles.`).then(e=>e.delete(3000))
            }
            else {
                await db.hmset(exempt_type,ID.id,"<TBD>")
                return message.reply(`${ID.name} role was successfully added in the exempted roles.`).then(e=>e.delete(3000))
            }       

        }
   
    }
};