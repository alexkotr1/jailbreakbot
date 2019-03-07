const functions = require("../functions/functions").modules,
      detectors = require("../utilities/detectors").modules,
      tweaker = require("../functions/tweaks"),
      config = require("../config")

exports.message = async function(message){
    if (!message.guild || message.guild.id !== config.rjb || message.author.bot || !message.guild || !message.member || message.webhookID) return undefined
    functions.check_for_bad_words_and_invites_and_report(message)
    functions.add_experience_points(message);
    functions.check_for_mentions(message);
    functions.save_message(message);
    functions.save_images(message);
    detectors.detect_spoilers(message);
    tweaker(message)

}



