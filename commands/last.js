const Discord = require("discord.js");
/**
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 */
module.exports.run = async (bot, message) => {
    //finds the last message sent in a certain channel and returns it
    if (message.guild)
        if (!message.member.permissions.has("MANAGE_ROLES") && message.author.id != "[my id]") return;
    var channel = bot.channels.cache.get("[channel id]");
    do {
        if (!msg)
            var msg = (await channel.messages.fetch({ limit: 1 })).first();
        else
            msg = (await channel.messages.fetch({ limit: 1, before: "" + msg.id })).first();
    } while (!msg.content);
    while (msg.content.toLowerCase().includes("--ignore")) {
        if (msg.content.toLowerCase().includes("multiple", msg.content.toLowerCase().indexOf("--ignore"))) {
            var temp = msg.content.toLowerCase().substring(msg.content.toLowerCase().indexOf("--ignore"));
            var temp2 = parseInt(temp.split(" ")[2]);
            if (temp2) {
                if (temp2 > 100)
                    while (temp2 > 100) {
                        msg = (await channel.messages.fetch({ limit: 100, before: "" + msg.id })).last();
                        temp2 = temp2 - 100;
                    }
                if (temp2 > 0)
                    msg = (await channel.messages.fetch({ limit: temp2, before: "" + msg.id })).last();
            }
            else
                msg = (await channel.messages.fetch({ limit: 1, before: "" + msg.id })).first();
        }
        else
            msg = (await channel.messages.fetch({ limit: 1, before: "" + msg.id })).first();
    }
    var embed = new Discord.MessageEmbed()
        .setAuthor(msg.author.tag, msg.author.avatarURL())
        .setTimestamp(Date.now())
        .setColor("#080808")
        .setDescription(`**Message:**\n${msg.content}`)
        .setFooter(message.author.tag + "(" + message.author.id + ")", message.author.avatarURL());
    message.author.send(embed)
        .catch(() => {
            message.channel.send(`<@!${message.author.id}>, please let me dm you!`);
        });
}
module.exports.help = {
    name: "last",
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