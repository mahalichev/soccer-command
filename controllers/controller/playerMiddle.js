class ControllerMiddle {
    constructor() {
        this.action = "return"
    }

    execute(input, controllers) {
        const next = controllers[0]
        switch(this.action) {
            case "return":
                input.cmd = this.actionReturn(input)
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
        let flag = null
        switch (input.id) {
            case 1:
                flag = "fc"
                break
            case 2:
                flag = `fp${input.side == "l" ? "r" : "l"}c`
                break
            case 3:
                flag = `fp${input.side == "l" ? "r" : "l"}t`
                break
            case 4:
                flag = `fp${input.side == "l" ? "r" : "l"}b`
                break
            case 5:
                flag = "fct"
                break
            case 6:
                flag = "fcb"
                break
            case 7:
                flag = `fp${input.side}t`
                break
            case 8:
                flag = `fp${input.side}b`
                break
            case 9:
                flag = `fp${input.side}c`
                break
            case 10:
                flag = "fc"
                break
        }
        if (!input.flags[flag]) return {n: "turn", v: 60}
        if (Math.abs(input.flags[flag].angle) > 10)
            return {n: "turn", v: input.flags[flag].angle}
        if (input.flags[flag].distance > 5)
            return {n: "dash", v: input.flags[flag].distance * 2 + 30}
        this.action = "seekBall"
        return this.seekBall(input)
    }

    seekBall(input) {
        if (input.ball == null) return {n: "turn", v: 60}
        return {n: "turn", v: input.ball.angle}
    }
}

module.exports = ControllerMiddle