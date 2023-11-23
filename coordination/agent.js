const Msg = require('./msg')
const Manager = require('./decisionTree/manager')
const ScorerTree = require('./decisionTree/scorer')
const PasserTree = require('./decisionTree/passer')

class Agent {
    constructor(player, team){
        this.side = "l"
        this.team = team
        this.initCoordinates = player.getSocketPosition()
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
            this.run = true
        if (data.cmd == "init") this.initAgent(data.p)
        this.analyzeEnv(data.msg, data.cmd, data.p)
    }

    initAgent(parsedData){
        if (parsedData[0] == "r") this.side = "r"
        if (parsedData[1]) this.id = parsedData[1]
        if (this.id == 1) this.decisionTree = new ScorerTree()
        if (this.id == 2) this.decisionTree = new PasserTree()
        this.decisionTree.state.initCoordinates = this.initCoordinates
    }

    analyzeEnv(message, command, parsedData){
        if (this.run && (this.side == "l")){
            if (command == "hear") {
                if (parsedData[1] == "referee") {
                    if (parsedData[2] == "play_on") this.decisionTree.state.playing = true
                    if (parsedData[2].includes("goal_l")) {
                        if (this.id == 1) this.decisionTree.state.waitingBall = false
                        this.decisionTree.state.playing = false
                    }
                }
                if (parsedData[1] != "self") {
                    if (parsedData[2] == '"go"') if (this.id == 1) this.decisionTree.state.waitingBall = true
                }
                console.log(parsedData)
            }
            if (command == "see")
                this.act = Manager.getAction(this.decisionTree, parsedData)
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