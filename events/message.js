const functions = require("../functions/functions").modules
const detectors = require("../utilities/detectors").modules
const config = require("../config")
exports.message = async function(message){
    if (!message.guild || message.guild.id !== config.rjb || message.author.bot || !message.guild || !message.member || message.webhookID) return undefined
    functions.check_for_bad_words_and_invites_and_report(message);
    functions.add_experience_points(message);
    functions.check_for_mentions(message);
    functions.save_message(message);
    functions.find_tweaks(message);
    functions.save_images(message);
    functions.count_genius_message(message);
    functions.crosspost(message);
    detectors.detect_spoilers(message);

}


