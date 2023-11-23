class ControllerHigh {
    execute(input) {
        /* if ((input.heard != null) && (input.heard[2].startsWith("goal_"))) {
                input.newAction = "return"
                return {n: "move", v: "initial"}
        }*/
        if (input.heard != null) {
            if (input.heard[2].startsWith("goal_") || input.heard[2].startsWith("before_kick_off")) {
                input.newAction = "return"
                return {n: "move", v: "initial"}
            } else if (!input.heard[2].startsWith("play_on") && 
                    !input.heard[2].startsWith("drop_ball") &&
                    !input.heard[2].startsWith('"pass_') &&
                    !input.heard[2].startsWith('free_kick_') && 
                    !input.heard[2].startsWith('goalie_catch_ball_')
            ) {
                input.newAction = "return"
                return
            }
        }
        const immidiate = this.immidiateReaction(input)
        if (immidiate) return immidiate

        const defend = this.defendGoal(input)
        if (defend) return defend

        if (this.last == "defend")
            input.newAction = "return"
        this.last = "previous"
    }

    immidiateReaction(input) {
        if (input.canCatch) {
            if (this.last == "catched") {
                if (input.goalEnemy) {
                    this.last = "kick"
                    return {n: "kick", v: `110 ${input.goalEnemy.angle}`}
                }
                return {n: "turn", v: 60}
            }
            this.last = "catched"
            return {n: "catch", v: input.ball.angle}
        }
        if (input.canKick) {
            this.last = "kick"
            if (input.goalEnemy)
                return {n: "kick", v: `110 ${input.goalEnemy.angle}`}
            return {n: "kick", v: `10 ${input.rotSign * 45}`}
        }
    }

    defendGoal(input) {
        if (input.ball) {
            const close = input.closest("b", input.objects, input.teamOwn)
            if ((close[0] && (close[0].distance + 1 > input.ball.distance)) || (!close[0]) ||
                (input.ball.x && (Math.abs(input.ball.x) > 35) && (Math.abs(input.ball.y) < 20))) {
                if (input.ball.distance < 15) {
                    this.last = "defend"
                    if (Math.abs(input.ball.angle) > 5)
                        return {n: "turn", v: input.ball.angle}
                    return {n: "dash", v: 110}
                }
            }
        }
    }
}

module.exports = ControllerHigh