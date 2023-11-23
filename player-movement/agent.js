const Msg = require('./msg')
const Position = require('./position')
const readline = require('readline')
const { prototype } = require('events')

class Agent {
    constructor(player){
        this.speed = player.speed
        this.power = player.power
        this.rotationSpeed = player.rotationSpeed
        this.initialPosition = {x: player.x, y: player.y}
        this.calculatedPosition = null
        this.side = "l"
        this.act = null
        this.run = false
        this.controller = {
            acts: [],
            actId: 0,
            getAct(){return this.acts[this.actId]}
        }
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
            if (data.msg.includes("play_on"))
                this.run = true
        if (data.cmd == "init") this.initAgent(data.p)
        this.analyzeEnv(data.msg, data.cmd, data.p)
    }

    initAgent(parsedData){
        if (parsedData[0] == "r") this.side = "r"
        if (parsedData[1]) this.id = parsedData[1]
        this.controller.acts = [{act: "flag", flag: "frb"},
                                {act: "flag", flag: "ftr30"},
                                {act: "flag", flag: "fplt"},
                                {act: "kick", flag: "b", goal: `g${this.side == "l" ? "r" : "l"}`}]
    }

    analyzeEnv(message, command, parsedData){
        if (this.run){
            if (command == "see"){
                this.calculatePositions(parsedData)
                this.action(parsedData)
            }
            if (command == "hear")
                if (parsedData[2].startsWith("goal_"))
                    this.controller.actId = 0
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

    action(parsedData){
        let actionData = this.controller.getAct()
        if (actionData.act == "flag") {
            let flag = parsedData.filter(data =>
                ((typeof(data)) == "object") &&
                (data.cmd.p.join("") == actionData.flag))

            if (flag.length == 0) this.act = {n: "turn", v: this.rotationSpeed}
            else {
                flag = flag[0]
                if (flag.p[0] < 3) this.controller.actId += 1
                else {
                    if (flag.p[1] == 0) this.act = {n: "dash", v: this.speed}
                    else this.act = {
                        n: "turn",
                        v: (Math.abs(this.rotationSpeed) < Math.abs(flag.p[1])) ?
                            Math.abs(this.rotationSpeed) * Math.sign(flag.p[1]) :
                            flag.p[1]
                        }
                }
            }
        } else if (actionData.act == "kick") {
            let ball = parsedData.filter(data =>
                ((typeof(data)) == "object") &&
                (data.cmd.p.join("") == actionData.flag))
            let goal = parsedData.filter(data =>
                ((typeof(data)) == "object") &&
                (data.cmd.p.join("") == actionData.goal))

            if (ball.length == 0) this.act = {n: "turn", v: this.rotationSpeed}
            else {
                ball = ball[0]

                if (ball.p[0] >= 0.5) {
                    if (ball.p[1] == 0) this.act = {n: "dash", v: this.speed}
                    else this.act = {
                        n: "turn",
                        v: (Math.abs(this.rotationSpeed) < Math.abs(ball.p[1])) ?
                            Math.abs(this.rotationSpeed) * Math.sign(ball.p[1]) :
                            ball.p[1]
                        }
                } else {
                    if (goal.length == 0) this.act = {n: "kick", v: "5 45"}
                    else {
                        goal = goal[0]

                        if (Math.abs(goal.p[0]) >= 25) this.act = {n: "kick", v: `${this.power / 4} ${goal.p[1]}`}
                        else this.act = {n: "kick", v: `${this.power} ${goal.p[1]}`}
                    }
                }
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