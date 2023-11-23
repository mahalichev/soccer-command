class ControllerHigh {
    constructor() {
        this.passedId = null
    }

    execute(input) {
        let command = null
        if (input.heard != null) {
            if (input.heard[2].startsWith("goal_") || 
                input.heard[2].startsWith("before_kick_off"))
                command = {n: "move", v: "initial"}
            else 
                switch (input.heard[2]) {
                    case "kick_off_l":
                    case "kick_off_r":
                        if (input.side == input.heard[2].slice(-1))
                            command = this.playKickoff(input)
                        else input.newAction = "return"
                        break
                    case "offside_l":
                    case "offside_r":
                        break
                    case "free_kick_l":
                    case "free_kick_r":
                    case "corner_kick_l":
                    case "corner_kick_r":
                    case "kick_in_l":
                    case "kick_in_r":
                        if (input.side == input.heard[2].slice(-1))
                            command = this.playPass(input)
                        else input.newAction = "return"
                        break
                    default:
                        command = this.playDefault(input)
                        break
                }
        } else command = this.playDefault(input)
        if (command) return command
    }

    playDefault(input) {
        if (this.last == "passed") {
            this.last = "said"
            console.log(`${input.side}${input.id} pass_${input.side}${this.passedId}`)
            return {n: "say", v: `pass_${input.side}${this.passedId}`}
        }

        this.passedId = null

        const kickDefault = this.kickDefault(input)
        if (kickDefault) return kickDefault

        let run = null
        if (input.heard && (input.heard[2] == `"pass_${input.side}${input.id}"`))
            run = this.runToPassed(input)
        else run = this.runDefault(input)

        if (run) return run

        if ((this.last == "run") || (this.last == "said"))
            input.newAction = "return"
        this.last = "playDefault"
    }

    kickDefault(input) {
        if (input.canKick) {
            // Если был кому-то пас - игнорируем
            if (input.heard && input.heard[2].startsWith("passed_to_")) input.heard = null

            const closeEnemies = input.closest("b", input.objects, input.teamEnemy)
            const teammatesWithIds = input.getTeammatesIdentifiers(input.teamOwn)
            let targetToPass = null

            if (input.goalEnemy) {
                const closeToGoal = input.closest(input.goalEnemy.id, input.objects, teammatesWithIds)
                if (closeToGoal) targetToPass = closeToGoal[0]
            }
            // Получение идеального для паса союзника
            if ((targetToPass == null) && (input.position != null))
                teammatesWithIds.forEach(teammate => {
                    if (
                        (teammate.idx.includes("goalie") == false) && teammate.x
                        && (teammate.distance > 15) && (targetToPass == null)
                    ){
                        if (input.side == "l") {
                            if (teammate.x - input.position.x > 7) targetToPass = teammate
                        } else {
                            if (input.position.x - teammate.x > 7) targetToPass = teammate
                        }
                    }
                })
            // Если идеальный союзник найден делаем ему пас
            if (targetToPass != null) {
                this.last = "passed"
                this.passedId = targetToPass.idx
                return {n: "kick", v: `${targetToPass.distance * 1.3 + 20} ${targetToPass.angle}`}
            }
            // Если близко противник и наблюдаются союзники
            if ((closeEnemies.length > 0) && (closeEnemies[0].distance < 10) && (teammatesWithIds.length > 0)) {
                targetToPass = teammatesWithIds[0].idx.includes("goalie") ? 
                                (teammatesWithIds.length > 1 ? teammatesWithIds[1] : null) : 
                                teammatesWithIds[0]
                if (targetToPass != null) {
                    this.last = "passed"
                    this.passedId = targetToPass.idx
                    return {n: "kick", v: `${targetToPass.distance * 1.3 + 20} ${targetToPass.angle}`}
                }
            }
            // Удар по воротам или разворот мяча
            this.last = "kick"
            if (input.goalEnemy) {
                if (input.goalEnemy.distance > 30) return {n: "kick", v: `60 ${input.goalEnemy.angle}`}
                return {n: "kick", v: `110 ${input.goalEnemy.angle}`} 
            }
            return {n: "kick", v: `10 ${input.rotSign * 45}`}
        }
    }

    runDefault(input) {
        if (input.ball) {
            const closeTeammates = input.closest("b", input.objects, input.teamOwn)
            const closeEnemies = input.closest("b", input.objects, input.teamEnemy)
            if (
                (closeTeammates[0] && (closeTeammates[0].distance + 1 > input.ball.distance)) ||
                /*(
                    closeEnemies[0] && closeTeammates[0] && 
                    (closeEnemies[0].distance <= closeTeammates[0].distance)
                ) ||*/
                (!closeTeammates[0]) 
            ) {
                this.last = "run"
                if (Math.abs(input.ball.angle) > 5)
                    return {n: "turn", v: input.ball.angle}
                if (input.ball.distance > 5) return {n: "dash", v: 110}
                if (input.ball.distance > 2) return {n: "dash", v: 70}
                return {n: "dash", v: 50}
            }
        }
    }

    runToPassed(input) {
        console.log(`${input.side}${input.id} accepting pass`)
        // Если мяча не видно - повернуться
        if (input.ball == null) {
            if (this.last != "turnToPassed"){
                this.last = "turnToPassed"
                return {n: "turn", v: input.heard[1]}
            }
            return {n: "turn", v: 60}
        }
        this.last = "runToPassed"
        if (Math.abs(input.ball.angle) > 5)
            return {n: "turn", v: input.ball.angle}
        if (input.ball.distance > 5) return {n: "dash", v: 110}
        if (input.ball.distance > 2) return {n: "dash", v: 70}
        return {n: "dash", v: 50}
    }

    playPass(input) {
        const doPass = this.doPass(input)
        if (doPass) return doPass

        if ((this.last == "run") || (this.last == "runned"))
            input.newAction = "return"
        this.last = "playPass"
    }

    doPass(input) {
        if ((input.canKick == false) && (this.last != "runned")) {
            return this.runDefault(input)
        }
        this.last = "runned"

        const teammatesWithIds = input.getTeammatesIdentifiers(input.teamOwn)
        let target = null
        if (teammatesWithIds[0])
            teammatesWithIds.forEach(teammate => {
                if (teammate.idx.includes("goalie") == false) target = teammate
            })
        if (target == null)
            return {n: "turn", v: 20}

        console.log(target)
        if (target) {
            this.last = "passed"
            this.passedId = target.idx
            return {n: "kick", v: `${target.distance * 2 + 20} ${target.angle}`}
        }
    }

    playKickoff(input) {
        const kickKickoff = this.kickKickoff(input)
        if (kickKickoff) return kickKickoff

        const runDefault = this.runDefault(input)

        if (runDefault) return runDefault
        input.newAction = "return"
        this.last = "playKickoff"
    }

    kickKickoff(input) {
        if (input.canKick) {
            this.last = "passed"
            if (input.rotSign == 1) (input.side == "l") ? this.passedId = 4 : this.passedId = 3
            else (input.side == "l") ? this.passedId = 3 : this.passedId = 4
            return {n: "kick", v: `70 ${input.rotSign * 60}`}
        }
    }
}

module.exports = ControllerHigh