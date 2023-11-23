const dgram = require('dgram')

module.exports = function(agent, teamName, version){
    const socket = dgram.createSocket({type: 'udp4', reuseAddr: true})
    agent.setSocket(socket)

    socket.on('message', (message, info) => {
        agent.recieveMessage(message)
    })

    socket.sendMessage = function(message){
        socket.send(Buffer.from(message), 6000, 'localhost', (err, bytes) => {
            if (err) throw err
        })
    }
    console.log(`(init ${teamName} (version ${version}) ${agent.isGoalie ? "(goalie)" : ""})`)
    socket.sendMessage(`(init ${teamName} (version ${version}) ${agent.isGoalie ? "(goalie)" : ""})`)
}