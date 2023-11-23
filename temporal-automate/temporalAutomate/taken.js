class Taken {
    constructor() {
        this.ball = null
        this.ballPrev = null
        this.goal = null
        this.goalOwn = null
        this.teamOwn = []
        this.team = []
        this.time = 0
        this.center = null
        this.topFlagsCount = 0
        this.bottomFlagsCount = 0
    }

    setHear(input) {

    }

    getObject(objectsInSight, filter) {
        let objects = objectsInSight.filter(filter)
        let result = []
        for (let obj of objects)
            result.push({
                name: obj.cmd.p.join(""),
                distance: obj.p[0],
                angle: obj.p[1]
            })
        if (result.length == 0) return null
        if (result.length == 1) return result[0]
        return result
    }

    setSee(input, team, side) {
        this.time = input[0]

        if (this.ball)
            this.ballPrev = this.ball

        this.ball = this.getObject(input, (data) => 
            (typeof(data) == "object") && (data.cmd.p.join("") == "b"))
        
        let goalLeft = this.getObject(input, (data) => 
            (typeof(data) == "object") && (data.cmd.p.join("") == "gl"))
        let goalRight = this.getObject(input, (data) => 
            (typeof(data) == "object") && (data.cmd.p.join("") == "gr"))
        this.goal = (side == "l") ? goalRight : goalLeft
        this.goalOwn = (side == "l") ? goalLeft : goalRight

        this.team = this.getObject(input, (data) => 
            (typeof(data) == "object") && (data.cmd.p[0] == "p") && ((data.cmd.p.length == 1) || (data.cmd.p[1] != team)))
        this.teamOwn = this.getObject(input, (data) => 
            (typeof(data) == "object") && data.cmd.p.join("").startsWith(`p"${team}"`))
        
        this.center = this.getObject(input, (data) => 
            (typeof(data) == "object") && (data.cmd.p.join("") == "fc"))

        this.topFlagsCount = input.filter((data) => 
            (typeof(data) == "object") && (data.cmd.p.join("").startsWith("ft"))).length
        
        this.bottomFlagsCount = input.filter((data) => 
            (typeof(data) == "object") && (data.cmd.p.join("").startsWith("fb"))).length

        return {
            time: this.time,
            ball: this.ball,
            ballPrev: this.ballPrev,
            goal: this.goal,
            goalOwn: this.goalOwn,
            team: this.team,
            teamOwn: this.teamOwn,
            center: this.center,
            topFlagsCount: this.topFlagsCount,
            bottomFlagsCount: this.bottomFlagsCount
        }
    }
}

module.exports = Taken