const Agent = require('./agent')
const VERSION = 7

class PlayerData{
    constructor(x, y, side, isGoalie = false){
        this.x = x
        this.y = y
        this.side = side
        this.isGoalie = isGoalie
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
    new PlayerData(-15, 0, "l"), //1
    new PlayerData(-5, -15, "l"), //2
    new PlayerData(-15, -20, "l"), //3
    new PlayerData(-15, 20, "l"), //4
    new PlayerData(-20, -10, "l"), //5
    new PlayerData(-20, 10, "l"), //6
    new PlayerData(-30, -20, "l"), //7
    new PlayerData(-30, 20, "l"), //8
    new PlayerData(-30, 0, "l"), //9
    new PlayerData(-20, 5, "l"), //10
    new PlayerData(-50, 0, "l", true),
    new PlayerData(15, 0, "r"), //1
    new PlayerData(5, -15, "r"), //2
    new PlayerData(15, -20, "r"), //3
    new PlayerData(15, 20, "r"), //4
    new PlayerData(20, -10, "r"), //5
    new PlayerData(20, 10, "r"), //6
    new PlayerData(30, -20, "r"), //7
    new PlayerData(30, 20, "r"), //8
    new PlayerData(30, 0, "r"), //9
    new PlayerData(20, 5, "r"), //10
    new PlayerData(50, 0, "r", true),
]

function initAgent(player, index){
    let agent = new Agent(player, Teams[player.side])
    require('./socket')(agent, Teams[player.side], VERSION)
    setTimeout(() => agent.socketSend("move", `${player.getSocketPosition()}`), index * 50)
}

const start = () => {for (let index in Players) initAgent(Players[index], index + 1)}

start()
