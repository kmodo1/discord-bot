const Discord = require("discord.js");
const ms = require("ms");
/**
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 */
module.exports.run = async (bot, message) => {
    //cancells a giveaway
    if (message.guild)
        if (!message.member.permissions.has("MANAGE_MESSAGES") && message.author.id != "[my id]") return;
    try {
        if (!message.content.toLowerCase().split(" ")[1]) return message.channel.send("Please supply a channel name or id");
        if (!message.content.toLowerCase().split(" ")[2]) return message.channel.send("Please supply a message id");
        var channel = message.guild.channels.cache.find(c => c.id == message.content.toLowerCase().split(" ")[1].replace(/\D/g, ''));
        if (!channel)
            var channel = message.guild.channels.cache.find(c => c.name == message.content.toLowerCase().split(" ")[1]);
        if (!channel)
            return message.channel.send("Could not find channel with id or name: " + message.content.toLowerCase().split(" ")[1]);
        var msg = channel.messages.cache.find(m => m.id == message.content.toLowerCase().split(" ")[2].replace(/\D/g, ''));
        if (!msg)
            return message.channel.send("Could not find the message with id: " + message.content.toLowerCase().split(" ")[2]);
        if (msg.author.id != "[bot id]" || !msg.embeds[0])
            return message.channel.send("That message is not a giveaway from this bot!");
        if (msg.embeds[0].footer.text != "Ends")
            return message.channel.send("That giveaway has already ended!");
        if (!message.content.toLowerCase().includes("--force")) {
            var filter = m => (m.content.toLowerCase() == "confirm" || m.content.toLowerCase() == "cancel");
            var cancelled = false;
            if (msg)
                await message.channel.send("This will immediately end that giveaway WITHOUT selecting winners\n`Say confirm or cancel`").then(async () => {
                    await message.channel.awaitMessages(filter, { max: 1, time: ms("20m"), errors: ['time'] })
                        .then(async messages => {
                            if (messages.first().content.toLowerCase() == "cancel") {
                                cancelled = true;
                                return messages.first().channel.send("Cancelled");
                            }
                            if (messages.first().content.toLowerCase() == "confirm") messages.first().channel.send("Confirmed");
                        })
                        .catch(() => {
                            message.channel.send("Closed because of a lack of responses after 20 minutes");
                        })
                });
            if (cancelled) return;
        }
        try {
            var embd = msg.embeds[0];
            var prize = embd.description.substring(14, embd.description.length - 7);
            msg.channel.send("A giveaway has been cancelled! 😢 https://discordapp.com/channels/" + msg.guild.id + "/" + msg.channel.id + "/" + msg.id);
            var embed = new Discord.MessageEmbed()
                .setColor("#a50c0c")
                .setAuthor("Giveaway Cancelled!", "[bot avatar]")
                .setDescription(":tada: Prize: " + prize + " :tada:")
                .addField("Winners: ", embd.fields[0].value, true)
                .addField("Hosted By: ", `<@!${embd.fields[1].value}>`, true)
                .setFooter("Cancelled")
                .setTimestamp(Date.now());
            msg.edit(embed);
        } catch (err) {
            logmsg(err, bot, message);
        }
    } catch (err) {
        logmsg(err, bot, message);
    }
}
module.exports.help = {
    name: "gcancel",
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