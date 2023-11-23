const Msg = require('./msg')
const Position = require('./position')
const readline = require('readline')
const { prototype } = require('events')

class Agent {
    constructor(player){
        this.side = "l"
        this.initialPosition = {x: player.x, y: player.y}
        this.rotationSpeed = player.rotationSpeed
        this.calculatedPosition = null
        this.run = false
        this.act = {n: "turn", v: player.rotationSpeed}
    }

    recieveMessage(message){
        let data = message.toString('utf8')
        this.processMessage(data)
        this.sendCommand()
    }

    setSocket(socket){
        this.socket = socket
    }

    socketSend(command, value){
        this.socket.sendMessage(`(${command} ${value})`)
    }

    processMessage(message){
        let data = Msg.parseMsg(message)
        if (!data) throw new Error("Parse error\n" + message)
        if (data.cmd == "hear")
            if (data.p[2] == "play_on")
                this.run = true
        if (data.cmd == "init") this.initAgent(data.p)
        this.analyzeEnv(data.msg, data.cmd, data.p)
    }

    initAgent(parsedData){
        if (parsedData[0] == "r") this.side = "r"
        if (parsedData[1]) this.id = parsedData[1]
    }

    analyzeEnv(message, command, parsedData){
        if (this.run){
            if (command == "see") this.calculatePositions(parsedData)
        }
    }

    savePos(position){
        if (position != null) this.calculatedPosition = position
    }

    calculatePositions(parsedData){
        console.log(`Calculations to ${this.side} at initial position (${this.initialPosition.x} ${this.initialPosition.y})`)

        let flagsInSight = parsedData.filter(data =>
            ((typeof(data)) == "object") && ['f', 'g'].includes(data.cmd.p[0]))
        let objectsInSight = parsedData.filter(data =>
            ((typeof(data)) == "object") && ['p'].includes(data.cmd.p[0]))
        console.log(`    Flags in sight (count): ${flagsInSight.length}`)
        console.log(`    Objects in sight (count): ${objectsInSight.length}\n`)

        let flags = Position.parseFlags(flagsInSight)

        let agentPosition = Position.calculateAgentPosition(flags)
        this.savePos(agentPosition)

        if (this.calculatedPosition == null) return
        console.log(`    Calculated position (${this.calculatedPosition.x} ${this.calculatedPosition.y})\n`)

        let objectPositions = []
        objectsInSight.forEach(objectInSight => {
            let objectPosition = Position.calculateObjectPosition(objectInSight, flags)
            if (objectPosition != null) {
                objectPositions.push(objectPosition)
                console.log(`    Object in sight position (${objectPosition.x} ${objectPosition.y})`)
            }
        })
        console.log('\n\n')
    }

    sendCommand(){
        if (this.run) {
            if (this.act) {
                this.socketSend(this.act.n, this.act.v)
            }
        }
    }
}
module.exports = Agent