const Discord = require("discord.js");
const ms = require("ms");
const MersenneTwister = require("mersenne-twister");
const mt = new MersenneTwister();
/**
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 */
module.exports.run = async (bot, message) => {
    //guides you through starting a giveaway
    if (message.guild)
        if (!message.member.permissions.has("MANAGE_MESSAGES") && message.author.id != "[my id]") return;
    try {
        let channel, time, winners, prize, host, rqrole;
        channel = bot.channels.cache.find(c => c.name.toLowerCase() == "giveaways");
        if (!channel) return message.channel.send("Could not find a giveaway channel!");
        var filter = m => ((ms(m.content) != undefined && ms(m.content) < 1209600000 && ms(m.content) > 1000) || m.content == "end");
        await message.channel.send("Cool, how long does the giveaway last?\n`ms = miliseconds, s = seconds, m = minutes, h = hours, d = days(must be bewtween 1 second and 14 days), type end at any time to end the setup`").then(async () => {
            await message.channel.awaitMessages(filter, { max: 1, time: ms("20m"), errors: ['time'] })
                .then(async messages => {
                    if (messages.first().content.toLowerCase() == "end") return message.channel.send("Giveaway Start Ended");
                    time = ms(messages.first().content.toLowerCase());
                })
                .catch(() => {
                    message.channel.send("Closed because of a lack of responses after 20 minutes");
                })
        });
        if (!time) return;
        filter = m => ((0 < parseInt(m.content) && parseInt(m.content) < 100) || m.content == "end");
        await message.channel.send("👍, it will last " + ms(time) + ", how many winners does the giveaway have?\n`1-100`").then(async () => {
            await message.channel.awaitMessages(filter, { max: 1, time: ms("20m"), errors: ['time'] })
                .then(async messages => {
                    if (messages.first().content.toLowerCase() == "end") return message.channel.send("Giveaway Start Ended");
                    winners = parseInt(messages.first().content);
                })
                .catch(() => {
                    message.channel.send("Closed because of a lack of responses after 20 minutes");
                })
        });
        if (!winners) return;
        filter = m => (m.content);
        await message.channel.send("So, it will have " + winners + " winners, what is the prize?\n").then(async () => {
            await message.channel.awaitMessages(filter, { max: 1, time: ms("20m"), errors: ['time'] })
                .then(async messages => {
                    if (messages.first().content.toLowerCase() == "end") return message.channel.send("Giveaway Start Ended");
                    prize = messages.first().content.toLowerCase();
                })
                .catch(() => {
                    message.channel.send("Closed because of a lack of responses after 20 minutes");
                })
        });
        if (!prize) return;
        filter = m => (m.guild.members.cache.find(u => u.user.id == m.content.toLowerCase().replace(/\D/g, '')) || m.guild.members.cache.find(u => u.user.tag.toLowerCase() == m.content.toLowerCase()) || m.content.toLowerCase() == "end");
        await message.channel.send("Nice, the prize is " + prize + ", who is the host\n`ID, tag, or ping them`").then(async () => {
            await message.channel.awaitMessages(filter, { max: 1, time: ms("20m"), errors: ['time'] })
                .then(async messages => {
                    if (messages.first().content.toLowerCase() == "end") return message.channel.send("Giveaway Start Ended");
                    host = message.guild.members.cache.find(u => u.user.id == messages.first().content.toLowerCase().replace(/\D/g, ''));
                    if (!host)
                        host = message.guild.members.cache.find(u => u.user.tag.toLowerCase() == messages.first().content.toLowerCase());
                })
                .catch(() => {
                    message.channel.send("Closed because of a lack of responses after 20 minutes");
                })
        });
        if (!host) return;
        filter = m => (m.guild.roles.cache.find(r => r.id == m.content.replace(/\D/g, '')) || m.guild.roles.cache.find(r => r.name.toLowerCase() == m.content.toLowerCase()) || m.content.toLowerCase() == "end" || m.content.toLowerCase() == "none");
        await message.channel.send("Awesome, the host is " + host.user.username + ", is there a required role? \n`ID or name, say none if none`").then(async () => {
            await message.channel.awaitMessages(filter, { max: 1, time: ms("20m"), errors: ['time'] })
                .then(async messages => {
                    if (messages.first().content.toLowerCase() == "end") return message.channel.send("Giveaway Start Ended");
                    rqrole = message.guild.roles.cache.find(r => r.id == messages.first().content.toLowerCase().replace(/\D/g, ''));
                    if (!rqrole)
                        rqrole = message.guild.roles.cache.find(r => r.name.toLowerCase() == messages.first().content.toLowerCase());
                    if (messages.first().content.toLowerCase() == "none") rqrole = undefined;
                })
                .catch(() => {
                    message.channel.send("Closed because of a lack of responses after 20 minutes");
                    rqrole = false;
                })
        });
        if (rqrole == false) return;
        message.channel.send(":tada: Giveaway Started :tada:");
        try {
            var embed = new Discord.MessageEmbed()
                .setColor("#86c7ff")
                .setAuthor("Giveaway Started!", "[bot avatar]")
                .setDescription(":tada: Prize: " + prize + " :tada:")
                .addField("Winners: ", winners, true)
                .addField("Hosted By: ", `<@!${host.id}>`, true)
                .setFooter("Ends")
                .setTimestamp(Date.now() + time);
            if (rqrole)
                embed.addField("Required role", `<@&${rqrole.id}>`);
            try {
                channel.send(embed)
                    .then(m => {
                        m.react("🎉");
                        setTimeout(async () => {
                            if (m.embeds[0].footer.text != "Ends") return;
                            var reaction = await m.reactions.cache.get("🎉");
                            await reaction.users.fetch();
                            var rctns = reaction.users.cache;
                            var userarray = [];
                            for (const usr of rctns) {
                                userarray[userarray.length] = usr[1];
                            }
                            var temp = "";
                            if (winners > reaction.count)
                                winners = reaction.count - 1;
                            for (var i = 0; i < winners; i++) {
                                var temp3;
                                do {
                                    temp2 = `${userarray[Math.floor(mt.random() * userarray.length)]}, `;
                                    temp3 = m.guild.members.cache.get(temp2.replace(/\D/g, ''));
                                } while ((temp.indexOf(temp2) != -1) || (temp3.id == "[testing bot id]" || temp3.id == "[bot id]"));
                                temp += temp2;
                            }
                            m.channel.send("Congrats " + temp + " you have won " + prize + "! " + m.url);
                            var embd = m.embeds[0];
                            var embed = new Discord.MessageEmbed()
                                .setColor("#ffff99")
                                .setAuthor("Giveaway Ended!", "[bot avatar]")
                                .setDescription(":tada: Prize: " + prize + " :tada:")
                                .addField("Winners: ", temp, true)
                                .addField("Hosted By: ", `<@!${host.id}>`, true)
                                .setFooter("Ended")
                                .setTimestamp(embd.timestamp);
                            if (rqrole)
                                embed.addField("Required role", `<@&${rqrole.id}>`);
                            m.edit(embed);
                        }, time)
                    });
            } catch (err) {
                logmsg(err, bot, message);
            }
        } catch (err) {
            return logmsg(err, bot, message);
        }
    } catch (err) {
        logmsg(err, bot, message);
    }
}
module.exports.help = {
    name: "gstart",
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