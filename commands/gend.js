const Discord = require("discord.js");
const ms = require("ms");
const MersenneTwister = require("mersenne-twister");
const mt = new MersenneTwister();
/**
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 */
module.exports.run = async (bot, message) => {
    //ends a giveaway and selects winners
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
        var msg = await channel.messages.fetch(message.content.toLowerCase().split(" ")[2].replace(/\D/g, ''));
        if (!msg)
            return message.channel.send("Could not find the message with id: " + message.content.toLowerCase().split(" ")[2]);
        if ((msg.author.id != "[bot id]" && msg.author.id != "[testing bot id]") || !msg.embeds[0])
            return message.channel.send("That message is not a giveaway from this bot!");
        if (msg.embeds[0].footer.text != "Ends")
            return message.channel.send("That giveaway has already ended!");
        if (!message.content.toLowerCase().includes("--force")) {
            var filter = m => (m.content.toLowerCase() == "confirm" || m.content.toLowerCase() == "cancel");
            var cancelled = false;
            if (msg)
                await message.channel.send("This will immediately end that giveaway and select winners\n`Say confirm or cancel`").then(async () => {
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
            var reaction = await msg.reactions.cache.get("🎉");
            await reaction.users.fetch();
            var rctns = reaction.users.cache;
            var userarray = [];
            for (const usr of rctns) {
                userarray[userarray.length] = usr[1];
            }
            var temp = "";
            var temp2;
            var temp3;
            if (embd.fields[0].value > reaction.count)
                embd.fields[0].value = reaction.count - 1;
            for (var i = 0; i < embd.fields[0].value; i++) {
                do {
                    temp2 = `${userarray[Math.floor(mt.random() * userarray.length)]}, `;
                    temp3 = msg.guild.members.cache.get(temp2.replace(/\D/g, ''));
                } while ((temp.indexOf(temp2) != -1) || (temp3.id == "[testing bot id]" || temp3.id == "[bot id]"));
                temp += temp2;
            }
            var prize = embd.description.substring(14, embd.description.length - 7);
            msg.channel.send("Congrats " + temp + " you have won " + prize + "! " + msg.url);
            var embed = new Discord.MessageEmbed()
                .setColor("#ffff99")
                .setAuthor("Giveaway Ended!", "[bot avatar]")
                .setDescription(":tada: Prize: " + prize + " :tada:")
                .addField("Winners: ", temp, true)
                .addField("Hosted By: ", `${embd.fields[1].value}`, true)
                .setFooter("Ended")
                .setTimestamp(embd.timestamp);
            if (embd.fields[2] && embd.fields[2].value)
                embed.addField("Required role", embd.fields[2].value);
            try {
                msg.edit(embed);
            } catch (err) {
                logmsg(err, bot, message);
            }
        } catch (err) {
            logmsg(err, bot, message);
        }
    } catch (err) {
        logmsg(err, bot, message);
    }
}
module.exports.help = {
    name: "gend",
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