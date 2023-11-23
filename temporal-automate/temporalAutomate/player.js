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
        start: {name: "start", edges: ["kick", "far"]},
        kick: {name: "kick", edges: ["start"]},
        far: {name: "far", edges: ["start"]}
    },

    edges: {
        start_far: [{
                guard: [{
                        symbol: "lte",
                        left: 0.5,
                        right: {variable: "distance"}
                    }],
                synch: "runToBall!"
            }],
        far_start: [{
                guard: [{
                        symbol: "lt",
                        left: {variable: "distance"},
                        right: 0.5
                    }]
            }],

        start_kick: [{
                guard: [{
                        symbol: "lt",
                        left: {variable: "distance"},
                        right: 0.5
                    }],
                synch: "kick!"
            }],
        
        kick_start: [{}],
    },

    actions: {
        init(taken, state) {},

        beforeAction(taken, state) {
            state.variables.distance = Infinity
            if (taken.ball)
                state.variables.distance = taken.ball.distance
        },

        runToBall(taken, state) {
            state.next = false

            let ball = taken.ball
            if (!ball) return {n: "turn", v: 60}

            if (ball.distance < 0.5) {
                state.next = true
                return
            }

            if (Math.abs(ball.angle) > 5)
                return {n: "turn", v: ball.angle}

            if (ball.distance < 2) {
                return {n: "dash", v: 30}
            }

            return {n: "dash", v: 110}
        },

        kick(taken, state) {
            state.next = true

            let goal = taken.goal
            let player = taken.teamOwn ? taken.teamOwn[0] : null

            let target = null
            if (goal && player) target = (goal.distance < player.distance) ? goal : player
            else if (goal) target = goal
            else if (player) target = player

            if (target) {
                return {n: "kick", v: `${target.distance * 2 + 40} ${target.angle}`}
            }

            let rotateSign = Math.sign(taken.topFlagsCount - taken.bottomFlagsCount)
            if (!rotateSign) rotateSign = 1
            return {n: "kick", v: `10 ${rotateSign * 45}`}
        }
    }
}

module.exports = Goalie