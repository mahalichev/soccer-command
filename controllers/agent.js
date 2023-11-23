const Msg = require('./msg')
const GoalieLowController = require('./controller/goalieLow')
const GoalieMiddleController = require('./controller/goalieMiddle')
const GoalieHighController = require('./controller/goalieHigh')
const PlayerLowController = require('./controller/playerLow')
const PlayerMiddleController = require('./controller/playerMiddle')
const PlayerHighController = require('./controller/playerHigh')

class Agent {
    constructor(player, team){
        this.side = "l"
        this.team = team
        this.isGoalie = player.isGoalie
        this.initialPosition = player.getSocketPosition()
        this.lowController = player.isGoalie ? new GoalieLowController() : new PlayerLowController()
        this.middleController = player.isGoalie ? new GoalieMiddleController() : new PlayerMiddleController()
        this.highController = player.isGoalie ? new GoalieHighController() : new PlayerHighController()
        this.run = false
        this.act = null
        this.lastHeard = null
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
            this.run = true
        if (data.cmd == "init") this.initAgent(data.p)
        this.analyzeEnv(data.msg, data.cmd, data.p)
    }

    initAgent(parsedData){
        if (parsedData[0] == "r") this.side = "r"
        if (parsedData[1]) this.id = parsedData[1]
    }

    analyzeEnv(message, command, parsedData){
        if (command == "see"){
            this.act = this.lowController.execute(parsedData, this.lastHeard, this.id, this.team, this.side, [this.middleController, this.highController])
        }
        if ((command == "hear") && (parsedData[1] != "self")) {
            console.log(parsedData)
            this.lastHeard = parsedData
        }
    }

    sendCommand(){
        if (this.run && this.act) {
            if (this.act.n == "kick") this.lastHeard = null
            if ((this.act.n == "move") && (this.act.v == "initial")) {
                this.act.v = this.initialPosition
            }
            this.socketSend(this.act.n, this.act.v)
            this.act = null
        }
    }
}

module.exports = Agent