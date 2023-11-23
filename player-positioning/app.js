const Agent = require('./agent')
const VERSION = 7

const readline = require("readline/promises")
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

class PlayerData{
    constructor(x, y, side, speed, rotationSpeed){
        this.x = x
        this.y = y
        this.side = side
        this.speed = speed
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

function initAgent(player){
    let agent = new Agent(player)
    require('./socket')(agent, Teams[player.side], VERSION)
    setTimeout(() => agent.socketSend("move", `${player.getSocketPosition()}`), 50)
}

const start = async () =>{
    let players = []
    let addAgent = true
    while (addAgent){
        let position = (await rl.question("Enter position (x and y): "))
                       .split(" ").map(x => parseInt(x, 10))

        let rotationSpeed = parseInt((await rl.question("Rotational speed: ")), 10)
        let side = position[0] > 0 ? "r" : "l"

        oneMore = await rl.question("Continue? (true or false): ")
        if (oneMore != "true")
            addAgent = false
        players.push(new PlayerData(position[0], position[1], side, 80, rotationSpeed))
    }
    rl.close()

    for (let player of players){
        initAgent(player)
    }
}

start()
