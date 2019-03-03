const db = require('./db').db,
      config = require("../config")

exports.modules = {
       contains_invite : async function contains_invite(message) {
    if (!message.content.replace(/\s/g, '').toLowerCase().match(/discord\.gg\/|discord\.com\/invite\/|discordapp\.com\/invite\//g)) return undefined
    const exempted_channels = await db.hkeys("invites_exempted_channels")
    const exempted_roles = await db.hkeys("invites_exempted_roles")
    const exempt_invites = await db.hkeys("exempt_invites")
    if (!exempt_invites) return true
    const has_exempt_role = array_check_for_mutual_value(message.member.roles.array().map(item=>item.id), exempted_roles)
    if (message.content === "" || exempted_channels.indexOf(message.channel.id) > -1 || has_exempt_role.length) return undefined
    const occurrences_count = (message.content.match(/discord\.gg\/|discord\.com\/invite\/|discordapp\.com\/invite\//g) || []).length
    var occurrences_with_known_invite_count = 0
    exempt_invites.map(invite => {
        const regex = new RegExp(`discord\.gg\/${invite}|discord\.com\/invite\/${invite}|discordapp\.com\/invite\/${invite}`)
        occurrences_with_known_invite_count += (message.content.match(regex) || []).length
    })
    if (occurrences_count > occurrences_with_known_invite_count) return true
    else return false
},


     contains_bad_words : async function contains_bad_words(message) {
        const exempted_channels = await db.hkeys("filter_exempted_channels")
        const exempted_roles = await db.hkeys("filter_exempted_roles")
        if (message.member.roles.exists("id",config.moderator) || (message.member.roles.exists("id",config.genius) && message.channel.id !== config.general) || message.author.bot || message.content === "" || exempted_channels.indexOf(message.channel.id) > -1 || array_check_for_mutual_value(message.member.roles.array().map(item => item.id), exempted_roles).length) return []
        const modified_content = message.content
            .replace(/\s/g, "")
            .toLowerCase()
        const badwords = await db.hgetall("bad_words")
        if (!badwords) return []
        const names = Object.getOwnPropertyNames(badwords)
        var used_bad_words = []
        for (var x = 0; x < names.length; x++) {
            if (names[x] && modified_content.includes(names[x])) {
                used_bad_words.push({
                    bad_word: names[x],
                    priority: badwords[names[x]]
                })
            }
        }
        return used_bad_words
    },


    detect_spoilers : function detect_spoilers(message){
        if (message.channel.id === config.dev_backroom || (message.channel.id === config.development && message.member.roles.exists("id",config.developer && !message.attachments.array().some(pic=>pic.filename.startsWith("SPOILER_")))) || message.member.roles.exists("id",config.admin)) return undefined
        const count = (message.content.match(/\|\|/g) || []).length;
        if (count >= 2 || message.attachments.array().some(pic=>pic.filename.startsWith("SPOILER_"))) return message.delete().catch(console.error)
        }
}



function array_check_for_mutual_value(a, b) {
    var result = [];
    while (a.length > 0 && b.length > 0) {
        if (a[0] < b[0]) { a.shift(); }
        else if (a[0] > b[0]) { b.shift(); }
        else {
            result.push(a.shift());
            b.shift();
        }
    }
    return result
}