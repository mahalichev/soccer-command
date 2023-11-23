const Msg = require('./msg')
const Position = require('./position')
const Manager = require('./decisionTree/manager')
const FirstPlayerTree = require('./decisionTree/firstPlayer')
const SecondPlayerTree = require('./decisionTree/secondPlayer')
const ThirdPlayerTree = require('./decisionTree/thirdPlayer')
const GoalieTree = require('./decisionTree/goalie')

class Agent {
    constructor(player, team){
        this.side = "l"
        this.team = team
        this.isGoalie = player.isGoalie
        this.decisionTree = null
        this.run = false
        this.act = null
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
            if ((data.p[1] == "referee") && (data.p[2] == "play_on"))
                this.run = true
        if (data.cmd == "init") this.initAgent(data.p)
        this.analyzeEnv(data.msg, data.cmd, data.p)
    }

    initAgent(parsedData){
        if (parsedData[0] == "r") this.side = "r"
        if (parsedData[1]) this.id = parsedData[1]
        if (this.id == 1) this.decisionTree = new FirstPlayerTree()
        if (this.id == 2) this.decisionTree = new SecondPlayerTree()
        if (this.id == 3) this.decisionTree = new ThirdPlayerTree()
        if (this.isGoalie) this.decisionTree = new GoalieTree()
    }

    analyzeEnv(message, command, parsedData){
        if (this.run){
            if (command == "see"){
                if (this.isGoalie) this.act = Manager.getAction(this.decisionTree, parsedData, true)
                else this.act = Manager.getAction(this.decisionTree, parsedData)
            }
        }
    }

    sendCommand(){
        if (this.run) {
            if (this.act) {
                this.socketSend(this.act.n, this.act.v)
                this.act = null
            }
        }
    }
}

module.exports = Agent