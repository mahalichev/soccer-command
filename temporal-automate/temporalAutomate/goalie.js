const Goalie = {
    current: "start",

    state: {
        variables: {distance: Infinity},
        timers: {time: 0},
        next: true,
        synch: undefined,
        local: {}
    },

    nodes: {
        start: {name: "start", edges: ["close", "near", "far"]},
        close: {name: "close", edges: ["catch"]},
        catch: {name: "catch", edges: ["kick"]},
        kick: {name: "kick", edges: ["start"]},
        far: {name: "far", edges: ["start"]},
        near: {name: "near", edges: ["intercept", "start"]},
        intercept: {name: "intercept", edges: ["start"]}
    },

    edges: {
        start_close: [{
                guard: [{
                        symbol: "lt",
                        left: {variable: "distance"},
                        right: 2
                    }]
            }],
        start_near: [{
                guard: [{
                        symbol: "lt",
                        left: {variable: "distance"},
                        right: 15 //was 10
                    }, {
                        symbol: "lte",
                        left: 2,
                        right: {variable: "distance"}
                    }]
            }],
        start_far: [{
                guard: [{
                        symbol: "lte",
                        left: 15, //was 10
                        right: {variable: "distance"}
                    }]
            }],
        close_catch: [{synch: "catch!"}],
        catch_kick: [{synch: "kick!"}],
        kick_start: [{
                synch: "goBack!",
                assign: [{
                        name: "time", 
                        value: 0, 
                        type: "timer"
                    }]
            }],
        far_start: [{
                guard: [{
                        symbol: "lt",
                        left: 10,
                        right: {timer: "time"}
                    }],
                synch: "lookAround!",
                assign: [{
                        name: "time",
                        value: 0,
                        type: "timer"
                    }]
            }, {
                guard: [{
                        symbol: "lte",
                        left: {timer: "time"},
                        right: 10
                    }],
                synch: "ok!"
            }],
        near_start: [{
                synch: "empty!",
                assign: [{
                        name: "time",
                        value: 0,
                        type: "timer"
                    }]
            }],
        near_intercept: [{
                synch: "canIntercept?",
            }],
        intercept_start: [{
                synch: "runToBall!",
                assign: [{
                        name: "time",
                        value: 0,
                        type: "timer"
                }]
            }]
    },

    actions: {
        init(taken, state) {
            state.local.goalie = true
            state.local.catch = 0
        },

        beforeAction(taken, state) {
            state.variables.distance = Infinity
            if (taken.ball)
                state.variables.distance = taken.ball.distance
        },

        catch(taken, state) {
            if (!taken.ball) {
                state.next = true
                return
            }

            let angle = taken.ball.angle
            let distance = taken.ball.distance

            state.next = false
            if (distance > 0.5) {
                if (state.local.goalie) {
                    if (state.local.catch < 3) {
                        state.local.catch++
                        return {n: "catch", v: angle}
                    } else state.local.catch = 0
                }

                if (Math.abs(angle) > 15) return {n: "turn", v: angle}
                return {n: "dash", v: 40} //was 20
            }
            state.next = true
        },

        kick(taken, state) {
            state.next = false

            let rotateSign = Math.sign(taken.bottomFlagsCount - taken.topFlagsCount)
            if (!rotateSign) rotateSign = 1

            if (!taken.ball) {
                return {n: "turn", v: 60}
            }

            let distance = taken.ball.distance
            let angle = taken.ball.distance

            if (distance > 15) {
                state.next = true
                return
            }

            if (distance > 0.5) {
                if (Math.abs(angle) > 5) return {n: "turn", v: angle}
                return {n: "dash", v: distance > 1.5 ? 100 : 30}
            }

            let goal = taken.goal
            let player = taken.teamOwn ? taken.teamOwn[0] : null

            let target = null
            if (goal && player) target = (goal.distance < player.distance) ? goal : player
            else if (goal) target = goal
            else if (player) target = player

            if (target) {
                state.next = true
                return {n: "kick", v: `${target.distance * 2 + 40} ${target.angle}`}
            }
            return {n: "kick", v: `10 ${rotateSign * 45}`}
        },

        goBack(taken, state) {
            state.next = false

            let goalOwn = taken.goalOwn
            if (!goalOwn) return {n: "turn", v: 60}
            if (Math.abs(goalOwn.angle) > 10)
                return {n: "turn", v: goalOwn.angle}
            if (goalOwn.distance < 2) {
                state.next = true
                return {n: "turn", v: 180}
            }

            return {n: "dash", v: goalOwn.distance * 2 + 20}
        },

        lookAround(taken, state) {
            state.next = false
            state.synch = "lookAround!"
            if (!state.local.look)
                state.local.look = "init"

            switch (state.local.look) {
                case "init":
                    if (taken.center == null) return {n: "turn", v: 60}
                    state.local.look = "left"
                    return {n: "turn", v: taken.center.angle}
                case "left":
                    state.local.look = "center"
                    return {n: "turn", v: -60}
                case "center":
                    state.local.look = "right"
                    return {n: "turn", v: 60}
                case "right":
                    state.local.look = "back"
                    return {n: "turn", v: 60}
                case "back":
                    state.local.look = "init"
                    state.next = true
                    state.synch = undefined
                    return {n: "turn", v: -60}
                default: state.next = true
            }
        },

        canIntercept(taken, state) {
            let ball = taken.ball
            let ballPrev = taken.ballPrev
            
            state.next = true

            if (!ball) return false
            if (!ballPrev) return true
            if (ball.distance <= ballPrev.distance + 0.5) return true
            return false
        },

        runToBall(taken, state) {
            state.next = false

            let ball = taken.ball
            if (!ball) return this.goBack(taken, state)

            if (ball.distance <= 2) {
                state.next = true
                return
            }

            if (Math.abs(ball.angle) > 5)
                return {n: "turn", v: ball.angle}

            if (ball.distance < 2) {
                state.next = true
                return
            }

            return {n: "dash", v: 110}
        },

        ok(taken, state) {
            state.next = true
            return {n: "turn", v: 0}
        },

        empty(taken, state) {
            state.next = true
        }
    }
}

module.exports = Goalie