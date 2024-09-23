const Discord = require("discord.js");
/**
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 */
module.exports.run = async (bot, message) => {
    //does stuff
    if (message.guild)
        if (!message.member.permissions.has("MANAGE_MESSAGES") && message.author.id != "[my id]") return;
    var msg;
    try {
        msg = await message.channel.messages.fetch(message.content.split(" ")[1]);
    } catch (err) {
        if (typeof err == Discord.DiscordAPIError && err.message == "Unknown Message")
            message.author.send("PLEASE USE A VALID MESSAGE ID IN THE CORRECT CHANEL")
                .catch(err => {
                    message.channel.send("PLEASE USE A VALID MESSAGE ID IN THE CORRECT CHANEL");
                })
                .then(() => {
                    return;
                });
    }
    if (!msg) return message.author.send("PLEASE USE A VALID MESSAGE ID IN THE CORRECT CHANEL")
        .catch(err => {
            message.channel.send("PLEASE USE A VALID MESSAGE ID IN THE CORRECT CHANEL");
        })
        .then(() => {
            return;
        });
    await msg.fetch();
    if (msg.author.id != bot.user.id) return message.channel.send("That is not a message from me");
    if (msg.embeds[0] == undefined || msg.embeds[0] == null) {
        console.log(msg.embeds);
        return message.channel.send("NO EMBED: PLEASE SUPPLY A VALID SUGGESTION MESSAGE");
    }
    if (msg.embeds[0].footer.text != "Created" || !(msg.embeds[0].fields[0].name.endsWith("Suggestion:") || msg.embeds[0].fields[0].name.endsWith("Suggestion"))) {
        console.log(`Footer: ${msg.embeds[0].footer.text}, ${msg.embeds[0].footer.text != "Created"}`);
        console.log(`Name: ${msg.embeds[0].fields[0].name}, ${msg.embeds[0].fields[0].name.endsWith("Suggestion:") || msg.embeds[0].fields[0].name.endsWith("Suggestion")}`);
        return message.channel.send("PLEASE SUPPLY A VALID SUGGESTION MESSAGE");
    }
    var em = msg.embeds[0];
    await msg.fetch();
    await msg.reactions.cache.get("⬆").fetch();
    await msg.reactions.cache.get("⬇").fetch();
    var yes = msg.reactions.cache.get("⬆").count - 1;
    var no = msg.reactions.cache.get("⬇").count - 1;
    if (no < 0) no = 0;
    if (yes < 0) yes = 0;
    var a = message.content.split(" ");
    a.shift();
    a.shift();
    em.setFooter("Denied");
    em.setTimestamp(Date.now());
    em.setColor("#ff0a0a");
    em.setDescription(`${yes} : ${no}, ${no == 0 ? 100 : Math.floor((yes / (yes + no)) * 10000) / 100}% approval rate`);
    em.addField(`Denied by ${message.author.username}:`, `${a[0] ? a.join(" ") : "No Reason"}`);
    await msg.edit(em);
    await msg.reactions.removeAll();
    await message.delete();
}
module.exports.help = {
    name: "deny",
    red: false
}