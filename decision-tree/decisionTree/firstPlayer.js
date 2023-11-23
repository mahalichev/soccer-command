class firstPlayer {
    state = {
        next: 0,
        sequence: [
            {
                act: "flag",
                flag: "frb"
            }, {
                act: "flag",
                flag: "gl"
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
        next: "goalVisible"
    }

    goalVisible = {
        condition: (manager, state) => manager.getVisible(state.action.flag),
        trueCondition: "rootNext",
        falseCondition: "rotate"
    }

    rotate = {
        exec(_, state) {state.command = {n: "turn", v: 45}}, //was v: 90
        next: "sendCommand"
    }

    rootNext = {
        condition: (_, state) => state.action.act == "flag",
        trueCondition: "flagSeek",
        falseCondition: "ballSeek"
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
        next: "root" //was "rootNext"
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
        exec(_, state) {state.command = {n: "dash", v: 70}}, //was 100
        next: "sendCommand"
    }

    sendCommand = {
        command: (_, state) => state.command
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
            state.command = {n: "kick", v: `100 ${manager.getAngle(state.action.goal)}`} //was 100
        },
        next: "sendCommand"
    }

    ballGoalInvinsible =  {
        exec(_, state) {state.command = {n: "kick", v: "10 45"}},
        next: "sendCommand"
    }
}

module.exports = firstPlayer