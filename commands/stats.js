const Discord = require("discord.js");
/**
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 * @param {Number} uniquemembers 
 */
module.exports.run = async (bot, message, uniquemembers) => {
    //sends back current members, unique members to join, channes, and emojis
    if (uniquemembers == 0) return message.channel.send("The bot has just started, please wait a bit for the bot to fetch some initial numbers!");
    try {
        var channels = 0;
        message.guild.channels.cache.forEach(c => {
            if (c.type != "category") {
                channels++;
            }
        });
        var bots = 0;
        message.guild.members.cache.forEach(m => {
            if (m.user.bot) {
                bots++;
            }
        });
        var embed = new Discord.MessageEmbed()
            .setAuthor("Server Stats for " + message.guild.name, message.guild.iconURL())
            .setTimestamp(Date.now())
            .setColor("#37a6f8")
            .addField("Current Members", message.guild.memberCount, true)
            .addField("Unique Members", uniquemembers, true)
            .addField("Channels", channels, true)
            .addField("Bots", bots, true)
            .addField("Emojis", message.guild.emojis.cache.size, true)
            .addField('\u200b', '\u200b', true)
            .setFooter(message.author.tag + "(" + message.author.id + ")", message.author.avatarURL());
        message.channel.send(embed);
    } catch (err) {
        logmsg(err, bot, message);
    }
}
module.exports.help = {
    name: "stats",
    red: false
}
async function logmsg(err, bot, msg) { //logs a message to both the console, and a channel in the test server, with a random error code, the date, user tag, message, and user id
    let d = new Date();
    let errorcode = Math.floor(Math.random() * 1000000);
    msg.channel.send("Something went wrong, please make sure you followed the syntax correctly!, Errorcode: " + errorcode);
    console.log(err);
    console.log("Message: " + msg.content + ", User: " + msg.author.tag + "(ID: " + msg.author.id + "), Errorcode: " + errorcode);
    console.log("Time:" + d.getMonth() + "/" + d.getDate() + "/" + d.getFullYear() + " at: " + d.getHours() + ":" + d.getMinutes() + ":" + d.getMilliseconds());
    let embed = new Discord.MessageEmbed()
        .setTitle(err.name)
        .setDescription(err.message)
        .addField("Message: ", msg.content)
        .setFooter("User: " + msg.author.tag + "(ID: " + msg.author.id + "), Errorcode: " + errorcode)
        .setColor("#fc6400")
        .setTimestamp(Date.now());
    let guild = bot.guilds.cache.find(g => g.id == "[testing/admin server]");
    let channel = guild.channels.cache.find(c => c.name == "[error channel]");

    try {
        return channel.send(embed);
    } catch (err) {
        console.log(err);
    }
}