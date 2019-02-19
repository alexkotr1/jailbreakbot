const request = require("request-promise")


module.exports = async function getDevices(){
    const body = JSON.parse(await request("https://api.ipsw.me/v2.1/firmwares.json"))
var devices = [];
for (const board in body['devices']){
   devices.push({
      name: body['devices'][board].name.toLowerCase()
      .replace(/\(.*\)/g,"")
      .replace(/\s/g,"")
      .replace("plus","+")
      .replace("[s]","s")
      .replace("[S]","s")
      .trim(),
      oses: body['devices'][board].firmwares.map(firmware=>firmware.version),
      orig_name: body['devices'][board].name
      .replace(/\(.*\)/g,"")
      .replace("plus","+")
      .replace("[s]","s")
      .replace("[S]","s")
      .trim()

    })
}
for (var x = 0;x<devices.length;x++){
    const name = devices[x].name
for (var e = 0;e<devices.length;e++){
    if (x != e){
        if (devices[e].name === name) devices.splice(x,1)
    }
}
}
return devices
}



