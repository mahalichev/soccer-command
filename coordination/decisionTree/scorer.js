class scorer {
    state = {
        next: 0,
        playing: false,
        initCoordinates: "-10 -10",
        waitingBall: false,
        sequence: [
            {
                act: "flag",
                flag: "fplb"
            }, {
                act: "flag",
                flag: "fgrb"
            }, {
                act: "kick",
                flag: "b",
                goal: "gr"
            }],
        command: null
    }

    root = {
        exec(_, state) {
            state.action = state.sequence[state.next]
            state.command = null
        },
        next: "playing"
    }

    playing = {
        condition: (_, state) => state.playing,
        trueCondition: "goalVisible",
        falseCondition: "atInitCoordinates"
    }

    atInitCoordinates = {
        exec(_, state) {
            state.next = 0
            state.command = {n: "move", v: state.initCoordinates}
        },
        next: "sendCommand"
    }

    goalVisible = {
        condition: (manager, state) => manager.getVisible(state.action.flag),
        trueCondition: "rootNext",
        falseCondition: "rotate"
    }

    rotate = {
        exec(_, state) {state.command = {n: "turn", v: -55}},
        next: "sendCommand"
    }

    rootNext = {
        condition: (_, state) => state.action.act == "flag",
        trueCondition: "isBallInSight",
        falseCondition: "ballSeek"
    }

    isBallInSight = {
        condition: (manager, state) => manager.getVisible("b") && state.waitingBall,
        trueCondition: "ballInSight",
        falseCondition: "flagSeek"
    }

    ballInSight = {
        exec(_, state) {state.next = 2},
        next: "root"
    }

    flagSeek = {
        condition: (manager, state) => 3 > manager.getDistance(state.action.flag),
        trueCondition: "closeFlag",
        falseCondition: "farGoal"
    }

    closeFlag = {
        exec(_, state) {
            state.next++
            state.action = state.sequence[state.next]
        },
        next: "root"
    }

    farGoal = {
        condition: (manager, state) => Math.abs(manager.getAngle(state.action.flag)) > 4,
        trueCondition: "rotateToGoal",
        falseCondition: "runToGoal"
    }

    rotateToGoal = {
        exec(manager, state) {state.command = {n: "turn", v: manager.getAngle(state.action.flag)}},
        next: "sendCommand"
    }

    runToGoal = {
        exec(_, state) {state.command = {n: "dash", v: 70}},
        next: "sendCommand"
    }

    ballSeek = {
        condition: (manager, state) => 0.5 > manager.getDistance(state.action.flag),
        trueCondition: "closeBall",
        falseCondition: "farGoal"
    }

    closeBall = {
        condition: (manager, state) => manager.getVisible(state.action.goal),
        trueCondition: "ballGoalVisible",
        falseCondition: "ballGoalInvinsible"
    }

    ballGoalVisible = {
        exec(manager, state) {
            state.command = {n: "kick", v: `100 ${manager.getAngle(state.action.goal)}`}
        },
        next: "sendCommand"
    }

    ballGoalInvinsible = {
        exec(_, state) {state.command = {n: "kick", v: "10 -45"}},
        next: "sendCommand"
    }

    sendCommand = {
        command: (_, state) => state.command
    }
}

module.exports = scorer