const Discord = require("discord.js");
const ms = require("ms");
const MersenneTwister = require("mersenne-twister");
const redis = require("redis");
const mt = new MersenneTwister();
/**
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 * @param {redis.RedisClient} client
 */
module.exports.run = async (bot, message, client) => {
    //guides you through starting a giveaway
    if (message.guild)
        if (!message.member.permissions.has("MANAGE_MESSAGES") && message.author.id != "[my id]") return;
    let channel, time, winners, prize, host, rq, rqtype, rqrole;
    var filter = m => (message.guild.channels.cache.find(c => c.name.toLowerCase() == m.content.toLowerCase()) || message.guild.channels.cache.find(c => c.id == m.content.replace(/\D/g, '')) || m.content == "end");
    await message.channel.send("Cool, what channel is the giveaway in?\n`id or name, type end at any time to end the giveaway`").then(async () => {
        await message.channel.awaitMessages(filter, { max: 1, time: ms("20m"), errors: ['time'] })
            .then(async messages => {
                if (messages.first().content.toLowerCase() == "end") return message.channel.send("Giveaway Start Ended");
                channel = message.guild.channels.cache.find(c => c.id == messages.first().content.replace(/\D/g, ''));
                if (!channel)
                    channel = message.guild.channels.cache.find(c => c.name.toLowerCase() == messages.first().content.toLowerCase());
            })
            .catch(() => {
                message.channel.send("Closed because of a lack of responses after 20 minutes");
            })
    });
    if (!channel) return message.channel.send("Could not find a giveaway channel!");
    filter = m => ((ms(m.content) != undefined && ms(m.content) < 1209600000 && ms(m.content) > 1000) || m.content == "end");
    await message.channel.send("Amazing, the channel is " + channel.name + ", how long does the giveaway last?\n`ms = miliseconds, s = seconds, m = minutes, h = hours, d = days(must be bewtween 1 second and 14 days), type end at any time to end the setup`").then(async () => {
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
    filter = m => (m.content.toLowerCase() == "yes" || m.content.toLowerCase() == "no" || m.content.toLowerCase() == "end");
    await message.channel.send("Awesome, the host is " + host.user.username + ", are there required role(s)?\nSecondly: are there multiple required roles`please say \"yes\" or \"no\" to each question`").then(async () => {
        await message.channel.awaitMessages(filter, { max: 2, time: ms("20m"), errors: ['time'] })
            .then(async messages => {
                if (messages.first().content.toLowerCase() == "end") {
                    rq = undefined;
                    return message.channel.send("Giveaway Start Ended");
                }
                if (messages.first().content.toLowerCase() == "yes")
                    rq = true;
                else
                    rq = false;
                if (messages.last().content.toLowerCase() == "yes") {
                    filter = m => (m.content.toLowerCase() == "and" || m.content.toLowerCase() == "or" || m.content.toLowerCase() == "end");
                    await message.channel.send("Would like you like all roles to be required(say \"and\") or only one(say \"or\")").then(async () => {
                        await message.channel.awaitMessages(filter, { max: 1, time: ms("20m"), errors: ['time'] })
                            .then(async messages => {
                                if (messages.first().content.toLowerCase() == "end") {
                                    rq = undefined;
                                    return message.channel.send("Giveaway Start Ended");
                                }
                                if (messages.first().content.toLowerCase() == "and")
                                    rqtype = "and";
                                else
                                    rqtype = "or";
                            })
                            .catch(() => {
                                message.channel.send("Closed because of a lack of responses after 20 minutes");
                                rq = undefined;
                            })
                    })
                }
                else {
                    rqtype = false;
                }
            })
            .catch(() => {
                message.channel.send("Closed because of a lack of responses after 20 minutes");
                rq = undefined;
            })
    });
    if (rq == undefined) return;
    if (rq) {
        filter = m => (m.guild.roles.cache.find(r => r.id == m.content.split(", ")[0].replace(/\D/g, '')) || m.guild.roles.cache.find(r => r.name.toLowerCase() == m.content.split(", ")[0].toLowerCase()) || m.content.toLowerCase() == "end");
        await message.channel.send("What are the required role(s)?\n`ID, @, or name, if there are multiple seperate them by commas with one space`").then(async () => {
            await message.channel.awaitMessages(filter, { max: 1, time: ms("20m"), errors: ['time'] })
                .then(async messages => {
                    if (messages.first().content.toLowerCase() == "end") {
                        rqrole = false;
                        return message.channel.send("Giveaway Start Ended");
                    }
                    if (rqtype == false) {
                        rqrole = message.guild.roles.cache.find(r => r.id == messages.first().content.toLowerCase().replace(/\D/g, ''));
                        if (!rqrole)
                            rqrole = message.guild.roles.cache.find(r => r.name.toLowerCase() == messages.first().content.toLowerCase());
                    }
                    else {
                        rqrole = [];
                        for (let i of messages.first().content.toLowerCase().split(", ")) {
                            let temprole = message.guild.roles.cache.find(r => r.id == i.replace(/\D/g, ''));
                            if (!temprole)
                                temprole = message.guild.roles.cache.find(r => r.name.toLowerCase() == i);
                            if (!temprole) {
                                rqrole = false;
                                return message.reply("Please give valid information for every role!")
                            }
                            rqrole.push(temprole);
                        }
                    }
                })
                .catch(() => {
                    message.channel.send("Closed because of a lack of responses after 20 minutes");
                    rqrole = false;
                })
        });
        if (rqrole == false) return;
    }
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
        if (rq) {
            if (rqtype == false)
                embed.addField("Required role", `<@&${rqrole.id}>`);
            else {
                let tempstr = "";
                for (let i of rqrole) {
                    tempstr += `<@&${i.id}>, `
                }
                tempstr = tempstr.substring(0, tempstr.length - 2);
                if (rqtype == "and") {
                    embed.addField("Required role (all are required)", tempstr);
                }
                else if (rqtype == "or") {
                    embed.addField("Required role (one is required)", tempstr);
                }
            }
        }
        try {
            channel.send(embed)
                .then(m => {
                    m.react("🎉");
                    client.get("giveaways2", function (err, res) {
                        if (err) console.log(err);
                        if (!res || res == null || res == "null") return client.set("giveaways2", JSON.stringify([{ msgid: m.id + "", chnid: m.channel.id + "", len: time, date: Date.now() }]));
                        else {
                            res = JSON.parse(res);
                            res.push({ msgid: m.id + "", chnid: m.channel.id + "", len: time, date: Date.now() });
                            return client.set("giveaways2", JSON.stringify(res));
                        }
                    });
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
                            .addField("Hosted By: ", `<@!${host.id}> `, true)
                            .setFooter("Ended")
                            .setTimestamp(embd.timestamp);
                        if (rqrole)
                            embed.addField("Required role", `<@& ${rqrole.id}> `);
                        m.edit(embed);
                    }, time);
                });
        } catch (err) {
            logmsg(err, bot, message);
        }
    } catch (err) {
        return logmsg(err, bot, message);
    }
}
module.exports.help = {
    name: "gstart2",
    red: true
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