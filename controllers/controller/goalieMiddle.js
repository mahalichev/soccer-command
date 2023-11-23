class ControllerMiddle {
    constructor() {
        this.action = "return"
        this.turnData = "ft0"
    }

    execute(input, controllers) {
        const next = controllers[0]
        switch(this.action) {
            case "return":
                input.cmd = this.actionReturn(input)
                break
            case "rotateCenter":
                input.cmd = this.rotateCenter(input)
                break
            case "seekBall":
                input.cmd = this.seekBall(input)
                break
        }
        input.action = this.action

        if (next) {
            const command = next.execute(input, controllers.slice(1))
            if (command) return command
            if (input.newAction) this.action = input.newAction
            return input.cmd
        }
    }

    actionReturn(input) {
        if (!input.goalOwn) return {n: "turn", v: 60}
        if (Math.abs(input.goalOwn.angle) > 10)
            return {n: "turn", v: input.goalOwn.angle}
        if (input.goalOwn.distance > 3)
            return {n: "dash", v: input.goalOwn.distance * 2 + 30}
        this.action = "rotateCenter"
        return {n: "turn", v: 180}
    }

    rotateCenter(input) {
        if (!input.flags["fc"]) return {n: "turn", v: 60}
        this.action = "seekBall"
        return {n: "turn", v: input.flags["fc"].angle}
    }

    seekBall(input) {
        if (input.ball)
            return {n: "turn", v: input.ball.angle}
        if (input.flags[this.turnData]) {
            if (Math.abs(input.flags[this.turnData].angle) > 10)
                return {n: "turn", v: input.flags[this.turnData].angle}
            if (this.turnData == "ft0") this.turnData = "fb0"
            else if (this.turnData == "fb0") {
                this.turnData = "ft0"
                this.action = "rotateCenter"
                return this.rotateCenter(input)
            }
        }

        if (this.turnData == "ft0")
            return {n: "turn", v: input.side == "l" ? -30 : 30}
        if (this.turnData == "fb0")
            return {n: "turn", v: input.side == "l" ? 30 : -30}
        throw `Unexpected state ${JSON.stringify(this)}`
    }
}

module.exports = ControllerMiddle