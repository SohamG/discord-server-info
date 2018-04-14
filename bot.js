const qs = require("querystring")

const Discord = require("discord.js")
const client = new Discord.Client()
const dig = require('gamedig')
const config = require('./config.js')

process.on('uncaughtException', function (err) {
    console.error(err.stack);
    console.log("Node NOT Exiting...");
});


// const hook = new Discord.WebhookClient('')
client.login(config.token)
client.on('ready', () => console.log('YAY LOGGED IN'))
client.on('error', () => console.log('error pray it didnt break'))

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

let createEmbed = (info, sv, online) => {
	if (!online) {
		info = {
            name: 'Server is offline, or changing map',
            map: '-',
            pl: '0',
            maxpl: '0'
        }
	}
    return new Discord.RichEmbed()
    .setTitle(`**${info.name}**`)
    .setColor((online ? 0x37963F : 0x933836))
    .addField('Map:', `${info.map}`, true)
    .addField('Players:', `${info.pl}/${info.maxpl}`, true)
    .addField(`Connect:`,`steam://connect/${sv[0]}:${sv[1]}`, true)
    .setTimestamp()
}

let editor = () => {
    console.log(`== UPDATING ==`)
    let i = 0
    for(let sv of servers){
        let req = getInfo(sv[0], sv[1])
        req.then(x => {
            let info = {
				name: x.name,
				map: x.map,
				pl: x.raw.numplayers,
				maxpl: x.maxplayers
            }
            embed = createEmbed(info, sv, true)
            // let mess = channel.fetchMessage(m.id)) // This promise BS is fucked up
            // mess.then(a => a.edit({ embed }))
            sent[i].edit({ embed }).catch(e => {
				console.log("I failed to create an embed, shouldnt happen that often tbh, and guess what, shit fucking happens am I rite?")
            })
            console.log(`Edited ${sent[i].id}`)
			i++
        // continue loop
        }).catch(e => {
			
			embed = createEmbed([], sv, false)
			sent[i].edit({ embed }).catch(e => {
            	console.log("I failed to create an embed, shouldnt happen that often tbh, and guess what, shit fucking happens am I rite?")   
            })
			
			i++
		})
    }
}

client.on('message', (message) => {
    if(message.content.startsWith('showhere')){
        sent = new Array()
        channel = message.channel
        for(let sv of servers){
            // GET INITIAL DATA TO SEND MESSAGES, 
            // THEN AFTER SENDING TRIGGER THE EDIT LOOP
            let promise = getInfo(sv[0], sv[1])
            promise.then(x => {
                let info = {
                    name: x.name,
                    map: x.map,
                    pl: x.raw.numplayers,
                    maxpl: x.maxplayers
                }

                embed = createEmbed(info, sv, true)
                // msgs.add(await message.channel.send({embed}))
                message.channel.send({ embed }).then(c => {
					sent.push(c)
                    console.log('Created', c.id)
                })
                
                // msg.catch(e => console.log(e, 'ERROR SENDING EMBED-----------'))
               
            }).catch(e => {
				embed = createEmbed([], sv, false)
                // msgs.add(await message.channel.send({embed}))
                message.channel.send({ embed }).then(c => {
                    sent.push(c)
                    console.log('Created', c.id)
                })
                console.error("120:" + e + ' @ ' + sv)
            })
            
       }
       interval = setInterval(editor, 60000)
    }
})