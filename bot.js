
process.on('uncaughtException', function (err) {
    console.error(err.stack);
    console.log("Node NOT Exiting...");
});


const qs = require("querystring")

const Discord = require("discord.js")
const client = new Discord.Client()
const dig = require('gamedig')
const config = require('./config.js')
// const hook = new Discord.WebhookClient('')
client.login(config.token)

client.on('ready', () => console.log('YAY LOGGED IN'))

client.on('error', () => console.log('error pray it didnt break'))

// let getInfo = (ip, port) => {
//     console.log('querying')
//     let q = dig.query({
//         type: 'tf2',
//         host: ip,
//         port: port,
//     })
//     return q.then(x => {
//         //console.log(`______________________________________ ${x}`)
//         let map = x.map
//         let name = x.name
//         let pl = x.raw.numplayers
//         let maxpl = x.maxplayers
//         return {name, map, pl, maxpl}
//     }).catch(e => console.log(e))
// }
let interval
let channel
let sent = new Array()

let getInfo = (ip, port) => {
    return dig.query({
        type: 'tf2',
        host: ip,
        port: port,
        socketTimeout: 5000,
        udpTimeout: 10000
    })
}

//let servers = ['payload.gaminginstitute.in', 'funmode.gaminginstitute.in', 'jump.gaminginstitute.in', 'payload.gaminginstitute.in:27016', 'funmode.gaminginstitute.in']
let servers = config.servers

let createEmbed = (info, sv) => {
    return new Discord.RichEmbed()
    .setTitle(`${info.name}`)
    .setColor(0x0011FF)
    .addField('Map', `${info.map}`, true)
    .addField('Players', `${info.pl}/${info.maxpl}`, true)
    .addField(`Connect NOW!`,`steam://connect/${sv[0]}:${sv[1]}`, true)
    .setTimestamp()

}

let editor = () => {
    // console.log(`UPDATING`)
    console.log('IN EDITOR FUNC',sent)
    let i = 0
    for(let sv of servers){
        setTimeout(() => console.log('rate limiting...'), 1000)
        let req = getInfo(sv[0], sv[1])
        req.then(x => {
            let info = {
            name: x.name,
            map: x.map,
            pl: x.raw.numplayers,
            maxpl: x.maxplayers
            }
            embed = createEmbed(info, sv)
            // let mess = channel.fetchMessage(m.id)) // This promise BS is fucked up
            // mess.then(a => a.edit({ embed }))
            sent[i].edit({ embed }).catch(e => {
                process.exit(1)
            })
            console.log(`Edited ${sent[i].id}`)
            i = i + 1
        // continue loop
        }).catch(e => console.log(e, '-------'))
    }
}


client.on('message', (message) => {


    if(message.content.startsWith('showhere')){
        sent = new Array()
        channel = message.channel
        for(let sv of servers){
            // GET INITIAL DATA TO SEND MESSAGES, 
            // THEN AFTER SENDING TRIGGER THE EDIT LOOP

            console.log(sv[0], sv[1])
            
            let promise = getInfo(sv[0], sv[1])
            promise.then(x => {
                let info = {
                    name: x.name,
                    map: x.map,
                    pl: x.raw.numplayers,
                    maxpl: x.maxplayers
                }

                embed = createEmbed(info, sv)
                // msgs.add(await message.channel.send({embed}))
                message.channel.send({ embed }).then(c => {
                    console.log(sent.push(c))
                    console.log('logged', c.id)
                })
                
                // msg.catch(e => console.log(e, 'ERROR SENDING EMBED-----------'))
               
            }).catch(e => {
                console.error(e)
            })
            
       }
       console.log(sent.length, 'MESSAGE SET SIZE-------')
       setTimeout(() => console.log('waiting'), 50000)
       //console.log('done')
       interval = setInterval(editor, 60000)
    
    
    }






})
