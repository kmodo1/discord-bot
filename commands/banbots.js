const Discord = require("discord.js");
/**
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 */
module.exports.run = async (bot, message) => {
    if (message.guild)
        if (!message.member.permissions.has("MANAGE_ROLES") && message.author.id != "[my id]") return;
    message.reply("Banning all " + message.content.toLowerCase().split(" ")[1])
    message.guild.members.fetch().then(mbrs => {
        mbrs.forEach(mbr =>{
            if (mbr.user.username == message.content.toLowerCase().split(" ")[1]){
                mbr.ban({days: 0, reason: "bot"})
            }
        })
    })
}
module.exports.help = {
    name: "banbots",
    red: false
}