const redis = require("redis");
const ms = require("ms");
const fetch = require("node-fetch");
/**
 * @param {redis.RedisClient} client 
 */
module.exports.run = async (client) => {
  client.get("xpdata", async function (err, res) {
    console.log("Setting xpgains...")
    if (err) return console.log(err);
    var info1, info2;
    try {
      info1 = JSON.parse(res);
    } catch (err) {
      console.log(err);
    }
    try {
      info2 = await get_other_bot();
      if (info2.message)
        return console.log("Error(on _other_bot's end): " + info2.message);
    } catch (err) {
      console.log(err);
    }
    let info = [];
    info[0] = {
      "timedif": info2['time'].time - info1['time'].time
    };
    var count = 1;
    for (const x in info2) {
      if (x != 'time') {
        if (!info1[x]) {
          info[count] = {
            "id": x,
            "xpgain": info2[x].xp
          }
          count++;
        }
        else {
          if ((info2[x].xp - info1[x].xp) > 0) {
            info[count] = {
              "id": x,
              "xpgain": info2[x].xp - info1[x].xp
            }
            count++;
          }
          else {
            client.get(`${x}gains`, function (err, res) {
              if (res) {
                res = JSON.parse(res);
                res.XP.push(0);
                client.set(`${x}gains`, JSON.stringify(res));
              }
              else client.set(`${x}gains`, JSON.stringify({ XP: [0], SD: dt() }));
            });
          }
        }
      }
    }
    var timedif = info.shift();
    for (const i of info) {
      console.log(i);
      client.get(`${i.id}gains`, async function (err, res) {
        if (err) console.log(err);
        else if (!res) {
          client.set(`${i.id}gains`, JSON.stringify({ XP: [i.xpgain], SD: dt() }));
        }
        else {
          res = JSON.parse(res);
          res.XP.push(i.xpgain);
          setTimeout(() => {
            client.set(`${i.id}gains`, JSON.stringify(res));
          }, 100);
        }
      });
    }
    console.log("Done setting xp gains!");
  });
}
async function get_other_bot() { //ges _other_bot info, parses it, and returns an array of the lvl 2+ people
  try {
    xpinfo = await fetch(`https://_other_bot.xyz/api/plugins/levels/leaderboard/[server id]?limit=1000&page=0`)
      .then(response => response.json());
    if (!xpinfo)
      return {
        message: "Something went wrong while fetching the information!"
      };
    if (!xpinfo.players && xpinfo.players) {
      return xpinfo.error;
    }
    xpinfo = xpinfo.players;
    if (!xpinfo)
      return {
        message: "Something went wrong while fetching the information!"
      };
    xpinfo.unshift({ "time": Date.now() });
  } catch (err) {
    if (typeof err == fetch.FetchError) {
      return {
        message: "Something went wrong while fetching the information!"
      };
    }
    console.log(err);
  }
  let info = {};
  info['time'] = xpinfo[0];
  for (let i = 1; i < xpinfo.length; i++) {
    if (xpinfo[i].level > 1) {
      info[xpinfo[i].id] = {
        "xp": xpinfo[i].xp,
      }
    }
    else {
      i = xpinfo.length;
    }
  }
  return info;
}
function dt() {
  var d = new Date(Date.now() - ms("7h"));
  return ((d.getMonth() + 1) + "/" + d.getDate() + "/" + (d.getFullYear() + "").substring(2));
}