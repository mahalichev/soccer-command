const Msg = require('./msg')
const TAManager = require('./temporalAutomate/manager')
const GoalieAutomate = require('./temporalAutomate/goalie')
const PlayerAutomate = require('./temporalAutomate/player')

class Agent {
    constructor(player, team){
        this.side = "l"
        this.team = team
        this.isGoalie = player.isGoalie
        this.initialPosition = player.getSocketPosition()
        this.run = false
        this.act = null
        this.manager = new TAManager()
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
        if (data.cmd == "hear") {
            if ((data.p[1] == "referee") && (data.p[2] == "play_on"))
                this.run = true
            if ((data.p[1] == "referee") && (data.p[2].startsWith("goal_")))
                this.run = false
        }
        if (data.cmd == "init") this.initAgent(data.p)
        this.analyzeEnv(data.msg, data.cmd, data.p)
    }

    initAgent(parsedData){
        if (parsedData[0] == "r") this.side = "r"
        if (parsedData[1]) this.id = parsedData[1]
    }

    analyzeEnv(message, command, parsedData){
        if (this.run){
            if (command == "see"){
                if (this.isGoalie) {
                    this.act = this.manager.getAction(parsedData, GoalieAutomate, this.team, this.side)
                } else {
                    this.act = this.manager.getAction(parsedData, PlayerAutomate, this.team, this.side)
                }
            }
        }
    }

    sendCommand(){
        if (this.run && this.act) {
            this.socketSend(this.act.n, this.act.v)
            this.act = null
        }
        if (!this.run) {
            this.socketSend("move", this.initialPosition)
        }
    }
}

module.exports = Agent