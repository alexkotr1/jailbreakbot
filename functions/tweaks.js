const request = require('snekfetch');
const redis = require("async-redis"), db = redis.createClient({
    db : 1
});

function convertObjectToArrayForRedis(object){
    const array = []
    for (var e in object){
        if (typeof object[e] === 'object' && e === 'repo'){
           array.push('repo_url',object[e].url,'repo_name',object[e].name)
        }
       else  array.push(e,object[e])
    }
    return array
}
function getTweaks(string){
    const array = string.split(" ");
    const regex = /\[\[.+\]\]/g
    const tweaks = []
    for (var e = 0;e<array.length;e++){
        const occurrences = array[e].match(regex)
        if (occurrences) {
            for (var x = 0;x<occurrences.length;x++){
                const tweak = occurrences[x].substring(2,occurrences[x].length - 2);
                tweaks.push(tweak);
            }
        }
    }
    return tweaks
}

async function cacheTweaksIfNotCachedAndReturnAPIResponse(name){
    const cached = await db.exists(name.toLowerCase())
    if (cached){
        const data = await db.hgetall(name.toLowerCase());
        return data
    }
   const r =  await request.get('https://tss-saver.cloud.tyk.io/repoapi/v1/repo?query=' + name).send({ usingGoodRequestLibrary: true });
    const tweak = r.body.results[0]
    if (!tweak) return undefined
    db.hmset(tweak.display.toLowerCase(),convertObjectToArrayForRedis(tweak))
    if (tweak.paid == true || tweak.paid === 'true'){
    const r = await request.get(`https://tss-saver.cloud.tyk.io/repoapi/v1/price?type=${tweak.type}&query=${tweak.name}`)
    .send({ usingGoodRequestLibrary: true })
        db.hsetnx(tweak.display.toLowerCase(),'price',r.body.toString())
        tweak.price = r.body.toString()
    }
    return tweak
}


async function returnTweakInfo(message){
    const tweaks = getTweaks(message);
const array = []
for (var e =0;e<tweaks.length;e++){
    const res = await cacheTweaksIfNotCachedAndReturnAPIResponse(tweaks[e])
    if (res) array.push(res)
}
return array
}

   

module.exports.returnTweakInfo = returnTweakInfo