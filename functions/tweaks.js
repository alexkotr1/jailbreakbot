const request = require('snekfetch')
, redis = require("async-redis")
, db = redis.createClient({db : 1})
, cron = require("node-cron")
, edit_embeds = require("./functions").modules.edit_embeds
, { RichEmbed } = require("discord.js")
, config = require("../config")
, compareVersions = require('compare-versions');


cron.schedule('0 0 * * *', () => {
    db.flushdb();
  });

async function tweaker(message){
var matches = message.cleanContent.match(/\[\[[^\[\]]+\]\]/g)
if (!matches) return undefined
const embeds_array = []
const compatibility_embeds = []
const emoji = message.client.guilds.get(config.staff_server).emojis.get(config.compatibility_emoji);
for (var e = 0;e<matches.length;e++){
var tweak = matches[e].slice(2,matches[e].length - 2)
tweak = await checkCache(tweak)
if (tweak){
const embed = new RichEmbed()
.setTitle("Tweak Lookup")
.addField("Name",tweak.display ? tweak.display : 'N\/A')
.addField("Package ID",tweak.name ? tweak.name : 'N\/A')
.addField("Description",tweak.summary ? tweak.summary : 'N\/A')
.addField("Version",tweak.version ? tweak.version : 'N\/A')
.addField("Section",tweak.section ? tweak.section : 'N\/A')
.setColor(0x8A2BE2) 
.addField("Deb Download",`[Link](${tweak.deb ? tweak.deb : 'N\/A'})`)
.addField("Price",tweak.paid == true ? `\$${tweak.price}` : 'Free')
.addField("Repo",`[${tweak.repo ? tweak.repo.name : tweak.repo_name}](${tweak.repo ? tweak.repo.url : tweak.repo_url})`)
if (tweak.img) embed.setThumbnail(tweak.img)
if (tweak.compatibility && tweak.compatibility.length){
const versions = tweak.compatibility.map(version=>version.version).sort(compareVersions).map(version=>{
    for (var e = 0;e<tweak.compatibility.length;e++){
        if (version === tweak.compatibility[e].version){
            return `--> ${version} : ${tweak.compatibility[e].status}`
        }
    }
})
const compatibility_embed = new RichEmbed()
.setColor(0x4C4CFF)
.addField(`Compatibility lookup for ${tweak.display}`,versions.join("\n"))
compatibility_embeds.push(compatibility_embed)
}
else {
const notif_embed = new RichEmbed()
.setTitle("There are no compatibility reports for the latest version of " + tweak.display)
.setColor('black')
compatibility_embeds.push(notif_embed)
}
embeds_array.push(embed)
}
}
if (!embeds_array.length) return undefined
return edit_embeds(message,embeds_array,compatibility_embeds,emoji)
}

async function getPrice(tweak){
    const r = await request.get(`https://tss-saver.cloud.tyk.io/repoapi/v1/price?type=${tweak.type}&query=${tweak.name}`)
    .send({ usingGoodRequestLibrary: true })
    return r.body.toString()
}

async function checkCache(tweak){
const db_r = await db.get(tweak.toLowerCase().replace(/\s/g,""));
if (db_r){
try {
    const parsed = JSON.parse(db_r)
    return parsed
}
catch(err){}
}
const r =  await request.get('https://tss-saver.cloud.tyk.io/repoapi/v1/repo?query=' + tweak).send({ usingGoodRequestLibrary: true });
if (!r.body.results) return undefined
tweak = r.body.results[0]
if (!tweak) return undefined
if (tweak.paid && tweak.paid == true) tweak.price = await getPrice(tweak)
try{
const tweakCompatible = await request.get(`https://jlippold.github.io/tweakCompatible/json/packages/${tweak.name}.json`).send({ usingGoodRequestLibrary: true });
tweak.compatibility = tweakCompatible.body.versions.filter(version => version.tweakVersion === tweak.version && parseInt(version.iOSVersion.substr(0,version.iOSVersion.indexOf("."))) >= 11).map(version=>{
    return {
        version : version.iOSVersion,
        status : version.outcome.calculatedStatus
    }
})
}catch(err){
    tweak.compatibility = []
}
await db.set(tweak.display
.toLowerCase()
.replace(/\s/g,"")
,JSON.stringify(tweak)
)
return tweak
}
module.exports = tweaker

