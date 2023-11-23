class thirdPlayer {
    state = {
        team: "LeftTeam",
        teammate: null,
        command: null
    }

    root = {
        exec(_, state) {
            state.action = state.goal
            state.command = null,
            state.teammate = null
        },
        next: "start"
    }

    start = {
        exec(manager, state) {
            let teammates = manager.getTeammates(state.team)
            for (let teammate of teammates) {
                let angle = manager.getAngle(teammate)
                let distance = manager.getDistance(teammate)
                state.teammate = (state.teammate == null) ? {angle: angle, distance: distance}
                                                          : ((state.teammate.angle < angle)
                                                          ? {angle: angle, distance: distance}
                                                          : state.teammate)
            }
        },
        next: "teammateVisible"
    }

    teammateVisible = {
        condition: (_, state) => state.teammate == null,
        trueCondition: "rotate",
        falseCondition: "rootNext"
    }

    rotate = {
        exec(_, state) {state.command = {n: "turn", v: 55}}, //was v: 90
        next: "sendCommand"
    }

    rootNext = {
        condition: (_, state) => (state.teammate.distance < 1) && (state.teammate.angle > -40),
        trueCondition: "turn30",
        falseCondition: "checkDistance"
    }

    turn30 = {
        exec(_, state) {state.command = {n: "turn", v: 30}}, //was 30
        next: "sendCommand"
    }

    checkDistance = {
        condition: (_, state) => state.teammate.distance > 15, //was 10
        trueCondition: "farPlayer",
        falseCondition: "closePlayer"
    }

    farPlayer = {
        condition: (_, state) => Math.abs(state.teammate.angle) > 5,
        trueCondition: "rotateToPlayer",
        falseCondition: "runToPlayer"
    }

    rotateToPlayer = {
        exec(_, state) {state.command = {n: "turn", v: state.teammate.angle}},
        next: "sendCommand"
    }

    runToPlayer = {
        exec(_, state) {state.command = {n: "dash", v: 100}}, //was 80
        next: "sendCommand"
    }

    closePlayer = {
        condition: (_, state) => (state.teammate.angle > -25) || (state.teammate.angle < -40),
        trueCondition: "turnAngle30",
        falseCondition: "secondCheckDistance"
    }

    turnAngle30 = {
        exec(_, state) {state.command = {n: "turn", v: state.teammate.angle + 30}},
        next: "sendCommand"
    }

    secondCheckDistance = {
        condition: (_, state) => state.teammate.distance < 10, //was 7
        trueCondition: "dash40",
        falseCondition: "dash60"
    }

    dash40 = {
        exec(_, state) {state.command = {n: "dash", v: 40}}, //was 20
        next: "sendCommand"
    }

    dash60 = {
        exec(_, state) {state.command = {n: "dash", v: 60}}, //was 40
        next: "sendCommand"
    }

    sendCommand = {
        command: (_, state) => state.command
    }
}

module.exports = thirdPlayer