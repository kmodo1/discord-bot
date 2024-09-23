const Discord = require("discord.js");
/**
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 */
module.exports.run = async (bot, message) => {
    //finds latency and ping to discord 
    try {
        message.channel.send("Pinging...").then(m => {
            var ping = m.createdTimestamp - message.createdTimestamp;
            var embed = new Discord.MessageEmbed()
                .addField("Latency", ping)
                .addField("Ping to discord", bot.ws.ping)
                .setColor("#ff6de8")
                .setFooter(message.author.tag + "(" + message.author.id + ")", message.author.avatarURL())
                .setTimestamp(Date.now());
            try {
                m.channel.send(embed);
                m.delete();
            } catch (err) {
                logmsg(err, bot, message);
            }
        });
    } catch (err) {
        logmsg(err, bot, message);
    }
}
module.exports.help = {
    name: "ping",
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