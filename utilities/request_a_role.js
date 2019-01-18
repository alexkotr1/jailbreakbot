const config = require("../config")
const db = require("../utilities/db")
module.exports = async function request_a_role(client){
    const rjailbreak = client.guilds.get(config.rjb)
    const request_a_role = rjailbreak.channels.get(config.request_channel)
    request_a_role.fetchMessages({
            limit: 3
        })
        .then(async messages => {
            for (var x = 0; x < messages.array().length; x++) {
                const message = messages.array()[x];
                for (var y = 0; y < message.reactions.array().length; y++) {
                    const reactors = await message.reactions.array()[y].fetchUsers();
                    for (var e = 0; e < reactors.array().length; e++) {
                        if (reactors.array()[e].id !== message.author.id) message.reactions.array()[y].remove(reactors.array()[e].id);
                    }
                }
                const filter = (user) => user.id !== message.author.id;
                const collector = message.createReactionCollector(filter);
                collector.on("collect", async r => {
                    for (var x = 0; x < r.users.array().length; x++) {
                        if (r.users.array()[x].id !== message.author.id) {
                            r.remove(rjailbreak.members.get(r.users.array()[x].id)).catch(console.error);
                            const member = rjailbreak.members.get(r.users.array()[x].id);
                            const firmware_fields_length = parseInt(await db.get("firmware_updates_length"))
                            const jailbreak_fields_length = parseInt(await db.get("jailbreak_updates_length"))
                            const other_fields_length = parseInt(await db.get("other_updates_length"))
                            if (message.embeds[0].fields[0].name === 'Firmware Updates') {
                                var firmware_fields = []
                                for (var e = 0;e<firmware_fields_length;e++){
                                    firmware_fields.push(await db.hgetall("firmware_updates" + e.toString()))
                                }
                                for (var x = 0;x<firmware_fields.length;x++){
                                    if (r.emoji.id === firmware_fields[x].emoji){
                                        try {
                                            if (!member.roles.exists('id',firmware_fields[x].role)) member.addRole(firmware_fields[x].role)
                                            else member.removeRole(firmware_fields[x].role)
                                        }
                                        catch(err){
                                            console.error(err)
                                        }
                                    }
                                }
                            } else if (message.embeds[0].fields[0].name === 'Jailbreak Updates') {
                                var jailbreak_fields = []
                                for (var e = 0;e<jailbreak_fields_length;e++){
                                    jailbreak_fields.push(await db.hgetall("jailbreak_updates" + e.toString()))
                                }
                                for (var x = 0;x<jailbreak_fields.length;x++){
                                    if (r.emoji.id === jailbreak_fields[x].emoji){
                                        try {
                                            if (!member.roles.exists('id',jailbreak_fields[x].role)) member.addRole(jailbreak_fields[x].role)
                                            else member.removeRole(jailbreak_fields[x].role)
                                        }
                                        catch(err){
                                            console.error(err)
                                        }
                                    }
                                }
                              
                            } else if (message.embeds[0].fields[0].name.startsWith('Other')) {
                                var other_fields = []
                                for (var e = 0;e<other_fields_length;e++){
                                    other_fields.push(await db.hgetall("other_updates" + e.toString()))
                                }
                                for (var x = 0;x<other_fields.length;x++){
                                    if (r.emoji.id === other_fields[x].emoji){
                                        try {
                                            if (!member.roles.exists('id',other_fields[x].role)) member.addRole(other_fields[x].role)
                                            else member.removeRole(other_fields[x].role)
                                        }
                                        catch(err){
                                            console.error(err)
                                        }
                                    }
                                }                         
                            }
                        }
                    }
                });
            }
        })
}