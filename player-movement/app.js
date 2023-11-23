const Agent = require('./agent')
const VERSION = 7

const readline = require("readline/promises")
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

class PlayerData{
    constructor(x, y, side, speed, power, rotationSpeed){
        this.x = x
        this.y = y
        this.side = side
        this.speed = speed
        this.power = power
        this.rotationSpeed = rotationSpeed
    }

    getSocketPosition = () => {
        let x = this.x * ((this.side == "r") ? -1 : 1)
        let y = this.y * ((this.side == "r") ? -1 : 1)
        return `${x} ${y}`
    }
}

const Teams = {
    "l": "LeftTeam",
    "r": "RightTeam"
}

const Players = [
    new PlayerData(-20, 20, "l", 80, 80, 30),
    new PlayerData(50, -30, "r", 80, 80, 30)
]

function initAgent(player){
    let agent = new Agent(player)
    require('./socket')(agent, Teams[player.side], VERSION)
    setTimeout(() => agent.socketSend("move", `${player.getSocketPosition()}`), 50)
}

const start = () => {for (let index in Players) setTimeout(initAgent, index * 1500, Players[index])}

start()
