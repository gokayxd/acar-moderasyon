const { Client, Discord, MessageEmbed, Collection, WebhookClient } = require('discord.js');
const client = global.client = new Client({fetchAllMembers: true});
const moment = require('moment')
global.client = client;
require("moment-duration-format")
moment.locale('tr')
const fs = require("fs");
client.komutlar = new Collection();
client.komut = new Collection();
client.veri = require("./acar/acar-veri.json");
client.sistem = require("./acar/acar-ayar.json");
client.modüller = {}; 
client.altbaslik = client.veri.Tag + " " + client.veri.sunucuUfakIsim + " Developer by ACAR"
const qDb = require("quick.db");
const db = new qDb.table("ayarlar");
const cezaDb = new qDb.table("aCezalar");
const acarhook = new WebhookClient(client.veri.hosgeldinSistemi.webhookID, client.veri.hosgeldinSistemi.webhookTOKEN);
fs.readdir("./acar/Komutlar", (err, files) => {
    if(err) return console.error(err);
    files = files.filter(file => file.endsWith(".js"));
    console.log(`[ ${files.length} ] Adet ACAR Komutları Yüklenecek!`);
    files.forEach(file => {
        let referans = require(`./acar/Komutlar/${file}`);
  if(typeof referans.onLoad === "function") referans.onLoad(client);
            client.komutlar.set(referans.Isim, referans);
            if (referans.Komut) {
              referans.Komut.forEach(alias => client.komut.set(alias, referans));
            }
          });
});

  fs.readdir("./acar/Etkinlikler/", (err, files) => {
    if (err) return console.myTime(err);
    files.forEach(fileName => {
      let referans = require("./acar/Etkinlikler/" + fileName);
        referans.onLoad(client);
        client.on(referans.Etkinlik, referans.onRequest);
      console.log(
        `[~ ACAR~ ] (${fileName}) isimli etkinlik yüklendi.`
      );
    });
  });
 client.on("message", (message) => {
    if([".link", "!link"].includes(message.content.toLowerCase())){ 
    return message.channel.send(message.client.veri.sunucuDavetLinki); 
    }
    if([".tag", "!tag"].includes(message.content.toLowerCase())){ 
      return message.channel.send(message.client.veri.Tag); 
    }
      if (message.author.bot ||!message.content.startsWith(client.sistem.a_Prefix) || !message.channel || message.channel.type == "dm") return;
      let args = message.content
        .substring(client.sistem.a_Prefix.length)
        .split(" ");
      let komutcuklar = args[0];
      let bot = message.client;
      args = args.splice(1);
      let calistirici;
      if (bot.komut.has(komutcuklar)) {
        calistirici = bot.komut.get(komutcuklar);
      
        calistirici.onRequest(bot, message, args);
      } else if (bot.komutlar.has(komutcuklar)) {
        calistirici = bot.komutlar.get(komutcuklar);
        calistirici.onRequest(bot, message, args);
      }
});
  client.gecmisTarihHesaplama = (date) => {
    const startedAt = Date.parse(date);
    var msecs = Math.abs(new Date() - startedAt);
  
    const years = Math.floor(msecs / (1000 * 60 * 60 * 24 * 365));
    msecs -= years * 1000 * 60 * 60 * 24 * 365;
    const months = Math.floor(msecs / (1000 * 60 * 60 * 24 * 30));
    msecs -= months * 1000 * 60 * 60 * 24 * 30;
    const weeks = Math.floor(msecs / (1000 * 60 * 60 * 24 * 7));
    msecs -= weeks * 1000 * 60 * 60 * 24 * 7;
    const days = Math.floor(msecs / (1000 * 60 * 60 * 24));
    msecs -= days * 1000 * 60 * 60 * 24;
    const hours = Math.floor(msecs / (1000 * 60 * 60));
    msecs -= hours * 1000 * 60 * 60;
    const mins = Math.floor((msecs / (1000 * 60)));
    msecs -= mins * 1000 * 60;
    const secs = Math.floor(msecs / 1000);
    msecs -= secs * 1000;
  
    var string = "";
    if (years > 0) string += `${years} yıl`
    else if (months > 0) string += `${months} ay ${weeks > 0 ? weeks+" hafta" : ""}`
    else if (weeks > 0) string += `${weeks} hafta ${days > 0 ? days+" gün" : ""}`
    else if (days > 0) string += `${days} gün ${hours > 0 ? hours+" saat" : ""}`
    else if (hours > 0) string += `${hours} saat ${mins > 0 ? mins+" dakika" : ""}`
    else if (mins > 0) string += `${mins} dakika ${secs > 0 ? secs+" saniye" : ""}`
    else if (secs > 0) string += `${secs} saniye`
    else string += `saniyeler`;
  
    string = string.trim();
    return `\`${string} önce\``;
  };
let anliktarih = Date.now()
let aylartoplam = {
  "01": "Ocak",
  "02": "Şubat",
  "03": "Mart",
  "04": "Nisan",
  "05": "Mayıs",
  "06": "Haziran",
  "07": "Temmuz",
  "08": "Ağustos",
  "09": "Eylül",
  "10": "Ekim",
  "11": "Kasım",
  "12": "Aralık"
};
let aylar = aylartoplam;
client.tarihsel = moment(anliktarih).format("DD") + " " + aylar[moment(anliktarih).format("MM")] + " " + moment(anliktarih).format("YYYY HH:mm")
client.emoji = function(x) {
  return client.emojis.cache.get(x);
};
client.on("guildMemberAdd", async member => {
          if(member.id == client.sistem.a_sID) {
              member.roles.add(client.veri.Roller.botcuRolu) 
              return
          };
          let acarkalkmazban = qDb.get(`akb_${member.guild.id}`)
          if(acarkalkmazban && acarkalkmazban.some(id => `k${member.user.id}` === id)) return;
          let acar = client.veri;
          let acarveri = db.get("ayar") || {};
          let cezalılar = cezaDb.get("cezalı") || [];
          let kalıcıcezalılar = cezaDb.get("kalıcıcezalı") || [];
          let yasakTaglilar = cezaDb.get("yasakTaglilar") || [];
          let kalicisusturulma = cezaDb.get("kalicisusturulma") || [];
          let sürelisusturma = cezaDb.get("susturulma") || [];
          let sessusturulma = cezaDb.get("sessusturulma") || [];
          let guvenili = Date.now()-member.user.createdTimestamp < 1000*60*60*24*7;
          if (acarveri.yasakTaglar && !acarveri.yasakTaglar.some(tag => member.user.username.includes(tag)) && yasakTaglilar.some(x => x.includes(member.id))) await cezaDb.set('yasakTaglilar', yasakTaglilar.filter(x => !x.includes(member.id)));
          if(cezalılar.some(x => x.includes(member.id)) || kalıcıcezalılar.some(x => x.id === member.id)){
          if(acar.Roller.jailRolu) member.roles.set([acar.Roller.jailRolu]).catch();
          } else if (acarveri.yasakTaglar && acarveri.yasakTaglar.some(tag => member.user.username.includes(tag))) {
           if(acar.Roller.yasakliTagRolu) member.roles.set([acar.Roller.yasakliTagRolu]).catch();
      if (!yasakTaglilar.some(id => id.includes(member.id))) cezaDb.push('yasakTaglilar', `y${member.id}`);
      member.send(`**${acar.Tag} ${acar.sunucuIsmi}** Yasak tag'da bulunduğunuz için otomatik olarak cezalıya atıldınız tagı çıkartana kadar cezalıda kalmaya devam ediceksin.`).catch();
    } else if (guvenili) {
            if(acar.Roller.supheliRolu) member.roles.set([acar.Roller.supheliRolu]).catch();
            if(acar.Kanallar.supheliLogKanali && member.guild.channels.cache.has(acar.Kanallar.supheliLogKanali)) return;
          } else if(acar.kayıtRolleri.kayıtsızRolleri) member.roles.add(acar.kayıtRolleri.kayıtsızRolleri).catch();
          if(sürelisusturma.some(x => x.id === member.id) || kalicisusturulma.some(x => x.includes(member.id))) member.roles.add(acar.Roller.muteRolu).catch();
          if(sessusturulma.some(x => x.id === member.id) && member.voice.channel) member.voice.setMute(true).catch();
          if(acar.IkinciTag) member.setNickname(`${acar.IkinciTag} İsim | Yaş`).catch();
          else if(acar.Tag) member.setNickname(`${acar.Tag} İsim | Yaş`).catch();
          var gün = moment(member.user.createdAt).format('DD')
          if(moment(member.user.createdAt).format('DD') === '01') {
             var gün = '1'
             }
          if(moment(member.user.createdAt).format('DD') === '02') {
             var gün = '2'
           }
          if(moment(member.user.createdAt).format('DD') === '03') {
             var gün = '3'
           }
          if(moment(member.user.createdAt).format('DD') === '04') {
             var gün = '4'
           }
          if(moment(member.user.createdAt).format('DD') === '05') {
             var gün = '5'
           }
          if(moment(member.user.createdAt).format('DD') === '06') {
             var gün = '6'
           }
          if(moment(member.user.createdAt).format('DD') === '07') {
             var gün = '7'
           }
          if(moment(member.user.createdAt).format('DD') === '08') {
             var gün = '8'
           }
          if(moment(member.user.createdAt).format('DD') === '09') {
             var gün = '9'
           }
          var tarih = ''
          if(moment(member.user.createdAt).format('MM') === '01') {
              var tarih = `${gün} Ocak ${moment(member.user.createdAt).format('YYYY')} ${moment(member.user.createdAt).format('HH')}:${moment(member.user.createdAt).format('mm')}`
          }
          if(moment(member.user.createdAt).format('MM') === '02') {
              var tarih = `${gün} Şubat ${moment(member.user.createdAt).format('YYYY')}${moment(member.user.createdAt).format('HH')}:${moment(member.user.createdAt).format('mm')}`
          }
          if(moment(member.user.createdAt).format('MM') === '03') {
              var tarih = `${gün} Mart ${moment(member.user.createdAt).format('YYYY')} ${moment(member.user.createdAt).format('HH')}:${moment(member.user.createdAt).format('mm')}`
          }
          if(moment(member.user.createdAt).format('MM') === '04') {
              var tarih = `${gün} Nisan ${moment(member.user.createdAt).format('YYYY')} ${moment(member.user.createdAt).format('HH')}:${moment(member.user.createdAt).format('mm')}`
          }
          if(moment(member.user.createdAt).format('MM') === '05') {
              var tarih = `${gün} Mayıs ${moment(member.user.createdAt).format('YYYY')} ${moment(member.user.createdAt).format('HH')}:${moment(member.user.createdAt).format('mm')}`
          }
          if(moment(member.user.createdAt).format('MM') === '06') {
              var tarih = `${gün} Haziran ${moment(member.user.createdAt).format('YYYY')} ${moment(member.user.createdAt).format('HH')}:${moment(member.user.createdAt).format('mm')}`
          }
          if(moment(member.user.createdAt).format('MM') === '07') {
              var tarih = `${gün} Temmuz ${moment(member.user.createdAt).format('YYYY')} ${moment(member.user.createdAt).format('HH')}:${moment(member.user.createdAt).format('mm')}`
          }
          if(moment(member.user.createdAt).format('MM') === '08') {
              var tarih = `${gün} Ağustos ${moment(member.user.createdAt).format('YYYY')} ${moment(member.user.createdAt).format('HH')}:${moment(member.user.createdAt).format('mm')}`
          }
          if(moment(member.user.createdAt).format('MM') === '09') {
              var tarih = `${gün} Eylül ${moment(member.user.createdAt).format('YYYY')} ${moment(member.user.createdAt).format('HH')}:${moment(member.user.createdAt).format('mm')}`
          }
          if(moment(member.user.createdAt).format('MM') === '10') {
              var tarih = `${gün} Ekim ${moment(member.user.createdAt).format('YYYY')} ${moment(member.user.createdAt).format('HH')}:${moment(member.user.createdAt).format('mm')}`
          }
          if(moment(member.user.createdAt).format('MM') === '11') {
              var tarih = `${gün} Kasım ${moment(member.user.createdAt).format('YYYY')} ${moment(member.user.createdAt).format('HH')}:${moment(member.user.createdAt).format('mm')}`
          }
          if(moment(member.user.createdAt).format('MM') === '12') {
              var tarih = `${gün} Aralık ${moment(member.user.createdAt).format('YYYY')} ${moment(member.user.createdAt).format('HH')}:${moment(member.user.createdAt).format('mm')}`
          }
          acarhook.send(`
  ${client.emojis.cache.get(acar.Emojiler.hosgeldinGif1)} ${acar.sunucuUfakIsim} Sunucusuna Hoşgeldin!\n
  ${client.emojis.cache.get(acar.Emojiler.hosgeldinGif2)} ${member} (\`${member.id}\`) hesabın __${tarih}__ tarihinde ${client.gecmisTarihHesaplama(member.user.createdAt)} oluşturulmuş.\n
  ${client.emojis.cache.get(acar.Emojiler.hosgeldinGif3)} Ailemiz seninle birlikte **${member.guild.memberCount}** kişiye ulaştı! tagımızı alarak bizlere destek olabilirsin, <@&${acar.kayıtRolleri.kayıtYapanRoller}> rolüne sahip yetkililer senin ile ilgilenecektir.\n
  ${client.emojis.cache.get(acar.Emojiler.hosgeldinGif4)} Sunucu kurallarımız <#${acar.Kanallar.kurallarKanal}> kanalında belirtilmiştir. Unutma sunucu içerisinde ki ceza işlemlerin kuralları okuduğunu varsayarak gerçekleştirilecek.\n
  `); 


})

client.login(client.sistem.a_Token).catch(err => console.error("[~ ACAR ~] Discord API Botun tokenini doğrulayamadı."));
