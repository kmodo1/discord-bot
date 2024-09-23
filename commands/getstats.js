const Discord = require("discord.js");
/**
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 */
module.exports.run = async (bot, message) => {
    //gets the stats under mystats for someone else
    let str = message.content.toLowerCase().split(" ")[1];
    if (!str) return message.channel.send("Please supply a valid user username, tag, id, or mention");
    var user = message.guild.members.cache.find(m => m.user.id == str.replace(/\D/g, ''));
    if (!user)
        user = message.guild.members.cache.find(m => m.user.tag.toLowerCase() == str);
    if (!user)
        user = message.guild.members.cache.find(m => m.user.username.toLowerCase() == str);
    if (!user) return message.channel.send("Please supply a valid user username, tag, id, or mention");
    let userroles = Array.from(user.roles.cache.values());
    var temp3 = "";
    for (let t = 0; t < userroles.length; t++) {
        temp3 += `<@&${userroles[t].id}>, `
    }
    temp3 = temp3.substring(0, temp3.length - 26);
    var date = user.joinedAt.toString().substring(0, 25);
    var hr = date.substring(15, 21).trim();
    date = date.substring(0, 15).trim();
    if (parseInt(hr.split(":")[0]) > 12) {
        hr = (parseInt(hr.split(":")[0]) - 12) + hr.substring(2) + " PM";
    }
    else {
        hr = hr + " AM";
    }
    var date2 = user.user.createdAt.toString().substring(0, 25);
    var hr2 = date2.substring(15, 21).trim();
    date2 = date2.substring(0, 15).trim();
    if (parseInt(hr2.split(":")[0]) > 12) {
        hr2 = (parseInt(hr2.split(":")[0]) - 12) + hr2.substring(2) + " PM";
    }
    else {
        hr2 = hr2 + " AM";
    }
    var embed = new Discord.MessageEmbed()
        .setAuthor(user.user.tag, user.user.avatarURL())
        .setThumbnail(user.user.avatarURL())
        .setDescription(`<@${user.user.id}>`)
        .setColor("#17ac86")
        .addField("Joined Server", date + " " + hr + " EST", true)
        .addField("Registered Account", date2 + " " + hr2 + " EST", true)
        .addField("Roles - " + (userroles.length - 1), temp3)
        .setFooter(message.author.tag + "(" + message.author.id + ")", message.author.avatarURL())
        .setTimestamp(Date.now());
    try {
        message.channel.send(embed);
    } catch (err) {
        logmsg(err, bot, message);
    }
}
module.exports.help = {
    name: "getstats",
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