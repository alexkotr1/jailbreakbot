const { RichEmbed } = require("discord.js"),
        config = require("../config"),
        db = require("../utilities/db").db,
        xpdb = require("../utilities/db").xpdb,
        download = require('images-downloader').images,
        detectors = require("../utilities/detectors").modules,
        get_client = require("../index"),
        xp_user = require("../classes/xp_user").modules

exports.modules = {
    prepare_reports: async function prepare_reports(rjb) {
        const data = await db.hgetall("ping_preferences_options")
        if (!data) return undefined
        const reports_channel = rjb.channels.get(config.report_logs);
        if (!reports_channel) return undefined
        const msg = await reports_channel.fetchMessage(data.message);
        if (!msg) return undefined
        msg.reactions.array().map(async reaction => {
            const fetched_reactors = await reaction.fetchUsers()
            fetched_reactors.filter(user => !user.bot).array().map(reactor => reaction.remove(reactor));
        })
        const emoji_1 = '1⃣'
        const emoji_2 = '2⃣'
        const emoji_3 = '3⃣'
    
        await msg.react(emoji_1)
        await msg.react(emoji_2)
        await msg.react(emoji_3)
    
        const filter = (reaction, user) => reaction._emoji.name === emoji_1 && user.id !== msg.author.id
        const filter2 = (reaction, user) => reaction._emoji.name === emoji_2 && user.id !== msg.author.id
        const filter3 = (reaction, user) => reaction._emoji.name === emoji_3 && user.id !== msg.author.id
    
        const collector = msg.createReactionCollector(filter);
        const collector2 = msg.createReactionCollector(filter2);
        const collector3 = msg.createReactionCollector(filter3);
    
        collector.on("collect", async r => {
            const reactor = r.users.filter(user => !user.bot).array()[0]
            await db.hmset("mods_ping_preferences", reactor.id, 0)
            r.remove(reactor)
        });
        collector2.on("collect", async r => {
            const reactor = r.users.filter(user => !user.bot).array()[0]
            await db.hmset("mods_ping_preferences", reactor.id, 1)
            r.remove(reactor)
        });
        collector3.on("collect", async r => {
            const reactor = r.users.filter(user => !user.bot).array()[0]
            await db.hmset("mods_ping_preferences", reactor.id, 2)
            r.remove(reactor)
        });
    
    
    },    
    log: function log(embed){
        const client = get_client.modules.client
        client.guilds.get(config.rjb).channels.get(config.server_logs).sendEmbed(embed)
        return undefined
    },
    add_experience_points : async function add_experience_points(message){
        const user = await new xp_user(message.author.id)
        const xp_roles = await xpdb.hgetall("XP_ROLES")
        if (xp_roles){
        const actual_levels = Object.getOwnPropertyNames(xp_roles)
        for (var a = 0;a<actual_levels.length;a++){
            if (user.level >= parseInt(actual_levels[a])){
                const role = message.guild.roles.get(xp_roles[actual_levels[a]])
                if (role) message.member.addRole(role).catch(console.error)
            }
        }
    }
        const exists = await xpdb.exists(message.author.id + '_frozen_xp')
        if (exists) return undefined
        if (message.content.length <= 3) return undefined
        const is_spam = checkspam(message.content);
        if (is_spam == undefined) return undefined
        const key_name = `SPAM_CHECK_${message.author.id}`
        const time = await xpdb.hget(key_name,'time');
        const is_xp_blocked = await xpdb.exists('XP_BLOCKED_' + message.author.id)
        if (is_xp_blocked) return undefined
        if (!time) await xpdb.hmset(key_name,'message_1',message.content,'time',1);
        else {
            if (time <= 10){
                await xpdb.hmset(key_name,'message_' + time.toString(), message.content,'time',parseInt(time) + 1)
                await xpdb.set('XP_BLOCKED_' + message.author.id,'1','EX',3)
                return undefined
            }
            else {
                const messages = await xpdb.hgetall(key_name);
                var final_xp_to_add = 0;
                for (var x = 0;x<Object.values(messages).length;x++){
                    const xp_to_add = Math.round(Math.random() * 2 + Math.pow(Object.values(messages)[x].length,-1)*3);
                    final_xp_to_add += xp_to_add
                }
                xpdb.incrbyfloat('xp_' + message.author.id, final_xp_to_add).then(async ()=>{
                    await xpdb.del(key_name)
                    const new_level = await xp_user.get_level(message.author.id)
                    if ((new_level > user.level)) {
                       if(xp_roles){
                        const levels = Object.getOwnPropertyNames(xp_roles);
                        for (var e = 0;e < levels.length;e++){
                            if (new_level == parseInt(levels[e])){
                                const is_announced = await xpdb.exists('announced_' + new_level + '_' + message.author.id)
                                if (!is_announced){
                                const role = await message.guild.roles.get(xp_roles[levels[e]])
                                message.reply(`Congratulations!, you have reached level ${new_level} and have been promoted to ${role.name}.`).then(async ()=>{
                                await xpdb.set('announced_' + new_level + '_' + message.author.id,1)
                                })
                                return message.member.addRole(role).catch(console.error)
                                }
                            }                    
                        }
                      }
                    }
                })
    
            }
        }    
    },
    check_for_bad_words_and_invites_and_report : async function check_for_bad_words_and_invites_and_report(message) {
        if (message.author.bot || !message.guild || message.webhookID) return undefined
        const has_invite = await detectors.contains_invite(message)
        const has_bad_words = await detectors.contains_bad_words(message)
        const reports_channel = message.guild.channels.get(config.report_logs)
        var people_to_ping = has_bad_words.length ? await choose_who_to_ping(message, get_higher_priority(has_bad_words)) : await choose_who_to_ping(message, 1)
        people_to_ping = Array.isArray(people_to_ping) ? people_to_ping.join(",") : people_to_ping
        if (!reports_channel) return undefined
        if (has_invite && has_bad_words.length) {
            const embed = new RichEmbed()
            .setTitle("Bad words and server advertisement detected!")
            .addField("User",message.member)
            .addField("Bad words count",has_bad_words.length)
            .addField("Bad words",has_bad_words.map(word=>word.bad_word))
            .addField("Channel",message.channel)
            .addField("Message Content",message.content)
            .setColor("BLUE")
            .setThumbnail(message.author.avatarURL)
            message.delete().catch(console.error);     
            reports_channel.send(people_to_ping,{
                embed : embed
            })
        }
        else if (has_invite && !has_bad_words.length) {
            message.delete();
            const embed = new RichEmbed()
            .setTitle("Server advertisement detected")
            .addField("User",message.member)
            .addField("Message Content",message.content)
            .setThumbnail(message.author.avatarURL)
            .setColor(0xDA70D6)
            reports_channel.send(people_to_ping,{
                embed : embed
            })        
        }
        else if (has_bad_words.length && !has_invite) {
            message.delete().catch(console.error);
            const embed = new RichEmbed()
            .setTitle("Bad words detected!")
            .addField("User",message.member)
            .addField("Bad words count",has_bad_words.length)
            .addField("Bad words",has_bad_words.map(word=>word.bad_word))
            .addField("Channel",message.channel)
            .addField("Message Content",message.content)
            .setColor("GREEN")
            .setThumbnail(message.author.avatarURL)
    
            reports_channel.send(people_to_ping,{
                embed : embed
            })
        }
    },
    check_for_mentions : async function check_for_mentions(message){
        if (message.author.bot) return undefined
        const member_mentions = message.mentions.members.array()
        const role_mentions = message.mentions.roles.array()
        const reports = message.guild.channels.get(config.report_logs);
        const muted_role = message.guild.roles.get(config.muted)
        if (!reports || !muted_role) return undefined
        if (role_mentions.length >= 2){
            message.delete();
            message.member.addRole(muted_role).catch(console.error)
            const Discord = new RichEmbed()
            .setTitle("Spam detected!")
            .addField("User", message.member)
            .addField("Reason",`User pinged ${role_mentions.length} roles in a short period of time.`)
            .setColor("RED")
            .setThumbnail(msg.author.avatarURL)
            .setFooter(msg.author.id)
            return reports.send({embed}).then(()=>message.member.send("**Woah there!** That's a bit too fast. Contact a member of server staff to remove your mute."))
        }
        if (!member_mentions.length) return undefined
        const db_data = await db.get(`${message.author.id}_mention_count`)
        var count = db_data ? parseInt(db_data) : 0;
        count += member_mentions.length
        if (count >= 4) {
            message.delete().catch(console.error);
            message.member.addRole(muted_role).catch(console.error)
            var new_content = message.content
            member_mentions.map(member=>{
                const regex = new RegExp(`<@!?${member.user.id}\>`,'g')
                new_content = new_content.replace(regex,'@' + member.user.tag)
            });
            const Discord = new RichEmbed()
            .setTitle("Spam detected!")
            .addField("User", message.member)
            .addField("Reason",`User pinged ${count} members in a short period of time.`)
            .setColor("RED")
            .setThumbnail(msg.author.avatarURL)
            .setFooter(msg.author.id)
            return reports.send({embed}).then(()=>message.member.send("**Woah there!** That's a bit too fast. Contact a member of server staff to remove your mute."))
        }
        else db.set(`${message.author.id}_mention_count`,count,'EX','5')
    },
    count_genius_message : async function count_geniuses_message(message){
        if (!message.member.roles.exists("id",config.genius) || message.member.roles.exists("id",config.moderator)) return undefined
        if (message.channel.parent.id !== '355946591065997313' && message.channel.id !== '533094228041924629') return undefined
        await db.hincrby("genius_count",message.author.id,1)
    },
    save_message : async function save_message(message){	
        const count = await db.get(`${message.channel.id}messageListCount`)
        db.hmset(
        `messages${message.channel.id}${count ? count : 0}`,
        "id",message.id,
        "content",message.content,
        "channel",message.channel.id,
        "author",message.author.tag,
        "channelN",message.channel.name,
        "date",timeConverter(message.createdAt.getTime() / 1000)
        ).then(()=>db.incrbyfloat(message.channel.id + 'messageListCount',1))
    
    },
    save_images : function save_images(message){
        const client = get_client.modules.client
        if (message.attachments.array().length){
            const dest = './messages_pics/'
            download([message.attachments.array()[0].url], dest)
    .then(result => {
        const staff_server = client.guilds.get(config.staff_server)
        staff_server.channels.get(config.pics_logging_channel).send({
            files: [{
              attachment: result[0].filename,
              name: 'file.jpg'
            }]
          }).then(async msg=>{
              await db.set('pic_' + message.id,msg.attachments.array()[0].url)
          })
    })
    .catch(error => console.error("downloaded error", error))
        }
    
    },
    crosspost: async function crosspost(message){
        if (message.guild.id === config.log_server && message.webhookID == null) return message.delete() 
        const client = get_client.modules.client
        const log_server = client.guilds.get(config.log_server);
        if (!log_server || message.guild.id !== config.rjb) return undefined
        const log_channel = log_server.channels.find(channel=>channel.name === message.channel.name);
        if (!log_channel){
            log_server.createChannel(message.channel.name,message.channel.type).then(async channel=>{
                const parent = message.channel.parent
                if (parent){
                const log_parent = log_server.channels.filter(channel=>channel.type === 'category').find(channel=>channel.name === parent.name)
                if (!log_parent){
                    const new_log_parent = await log_server.createChannel(parent.name,'category');
                    new_log_parent.setPosition(parent.position)
                    channel.setParent(new_log_parent)
                }
                else channel.setParent(log_parent)
            }
                await channel.setPosition(message.channel.position)
                if (message.channel.topic) await channel.setTopic(message.channel.topic)
                channel.createWebhook('JailbreakBot (DO NOT REMOVE)').then(async webhook=>{
                    await db.hset("webhooks",channel.id,webhook.id)
                    webhook.send(`**${message.author.tag} : ** ${message.cleanContent}`,{
                        'username': message.author.id,
                        'avatarURL' : message.author.avatarURL,
                        'files' : message.attachments.array().map(attachment => attachment.url),
                        'disableEveryone' : true,
                        'split' : true
                      }).catch(console.error);   
                })
            })
        }
        else {
            const webhooks = await log_channel.fetchWebhooks()
            const id = await db.hget("webhooks",log_channel.id)
            var hook = webhooks.find(webhook => webhook.id === id)
            if (!hook){
               hook = await log_channel.createWebhook('JailbreakBot (DO NOT REMOVE)')
               await db.hset("webhooks",log_channel.id,hook.id)
            }
            hook.send(`**${message.author.tag} : ** ${message.cleanContent}`,{
                'username': message.author.id,
                'avatarURL' : message.author.avatarURL,
                'files' : message.attachments.array().map(attachment => attachment.url),
                'disableEveryone' : true,
                'split' : true
              }).catch(console.error);                
            

        }
        
    }, edit_embeds : async function edit_embeds(msg,embeds_array,sub_embeds,emoji){
        if (!embeds_array) return undefined
        embeds_array = embeds_array.filter(embed => embed instanceof RichEmbed)
        const has_sub = (sub_embeds && emoji) && sub_embeds.length
        for (var e = 0;e<embeds_array.length;e++){
            embeds_array[e].setFooter(embeds_array[e].footer ? `${embeds_array[e].footer.text} (Page ${e + 1}\/${embeds_array.length})` : `• Page ${e + 1}\/${embeds_array.length}`)            
        }
        const message = await msg.channel.send(embeds_array[0])
        await db.hset(message.id + 'reactions','page', 0)
        if (embeds_array.length > 1){
            await message.react('⬅')
            await message.react('➡')
        }
        if (has_sub) await apply_extra_embed(emoji,message,msg.author.id,sub_embeds,embeds_array)
        if (!embeds_array.length || embeds_array.length == 1) return undefined
        const filter = (reaction, user) => reaction.emoji.name === '➡' && user.id == msg.author.id
        const collector = message.createReactionCollector(filter, {
            time: 120000
        });
        collector.on('collect', async r => {
            const reactors = r.users.array();
            for (var e = 0; e < reactors.length; e++) {
                if (!reactors[e].bot) r.remove(reactors[e]);
            }
            var page = parseInt(await db.hget(r.message.id + 'reactions','page')) + 1
            if (!embeds_array[page]) {
                message.edit(embeds_array[0])
                return await db.hset(message.id + 'reactions','page',0)
            }
            message.edit(embeds_array[page]).then(() => {
                db.hincrby(message.id + 'reactions','page',1);
            })
        });
        const filter2 = (reaction, user) => reaction.emoji.name === '⬅' && user.id == msg.author.id
        const collector2 = message.createReactionCollector(filter2, {
            time: 120000
        });
        collector2.on('collect', async r => {
            const reactors = r.users.array();
            for (var e = 0; e < reactors.length; e++) {
                if (!reactors[e].bot) r.remove(reactors[e])
            }
            var page = parseInt(await db.hget(r.message.id + 'reactions','page')) - 1
            if (!embeds_array[page]) {
                message.edit(embeds_array[embeds_array.length - 1]);
                return await db.hset(message.id + 'reactions','page',embeds_array.length - 1)
            }
            message.edit(embeds_array[page]).then(() => {
                db.hincrby(message.id + 'reactions','page', -1);
            })
        });

        collector.on('end', () => db.del(message.id + 'reactions'))
    }


}


function get_higher_priority(arr) {
    if (!arr) return undefined
    var highest_priority = 0
    for (var x = 0; x < arr.length; x++) {
        if (arr[x].priority > highest_priority) highest_priority = arr[x].priority
    }
    return highest_priority
}

async function choose_who_to_ping(message, highest_priority) {
    if (highest_priority == 0) return ''
    else if (highest_priority == 1) {
        const db_mods_to_ping = await db.hgetall("mods_ping_preferences")
        if (!db_mods_to_ping) return ""
        const mods = message.guild.roles.get(config.moderator).members.array();
        var mods_to_ping = []
        for (var x = 0; x < mods.length; x++) {
            const mod = mods[x];
            if (db_mods_to_ping[mod.id]){
            if (db_mods_to_ping[mod.id] == 1 && mod.presence.status === 'online') mods_to_ping.push(`<@${mod.id}>`)
            else if (db_mods_to_ping[mod.id] == 2 && mod.presence.status !== 'dnd') mods_to_ping.push(`<@${mod.id}>`)
            else continue
            }
        }
        return mods_to_ping
    }
    else if (highest_priority == 2) {
        return message.guild.roles.get(config.moderator)
    }
    else return undefined
}

function timeConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    if (min.toString().length == 1) min = '0' + min;
    var sec = a.getSeconds();
    if (sec.toString().length == 1) sec = '0' + sec;
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
    return time;
}


function checkspam(string){
    if (!string) return undefined
    const init = string.split('');
    const final = eliminateDuplicates(init);
    const results = final.length == 1 ? 100 : ((init.length - final.length) / init.length) * 100;
    if (results > 70) return true
    return false
}


function eliminateDuplicates(arr) {
    var i,
        len = arr.length,
        out = [],
        obj = {};
    
    for (i = 0; i < len; i++) {
      obj[arr[i]] = 0;
    }
    for (i in obj) {
      out.push(i);
    }
    return out;
    }


async function apply_extra_embed(emoji,message,author_id,sub_embeds,embeds_array){
        await message.react(emoji)
        const filter3 = (reaction,user) => reaction.emoji.id === emoji.id && user.id === author_id
        const collector3 = message.createReactionCollector(filter3,{
            time: 120000
        })    
        collector3.on('collect', async r => {
            const reactors = r.users.array();
            for (var e = 0; e < reactors.length; e++) {
                if (!reactors[e].bot) r.remove(reactors[e])
            }
            var page = parseInt(await db.hget(r.message.id + 'reactions','page'))
            if (!sub_embeds[page]) return undefined
            const subbed = await db.hexists(message.id + 'reactions','subbed')
            if (subbed){
                 await message.edit(embeds_array[page])
                 await db.hdel(message.id + 'reactions','subbed')
            }
            else {
                await message.edit(sub_embeds[page])
                await db.hset(message.id + 'reactions','subbed',1)                 
            }
        });        
}