class goalie {
    state = {
        next: 0,
        catched: false,
        sequence: [
            {
                act: "flag",
                flag: "gr"
            }, {
                act: "kick",
                flag: "b",
                goal: "gl"
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
        exec(_, state) {state.command = {n: "turn", v: -60}}, //was v: 90
        next: "sendCommand"
    }

    rootNext = {
        condition: (_, state) => state.action.act == "flag",
        trueCondition: "flagSeek",
        falseCondition: "ballSeek"
    }

    flagSeek = {
        condition: (manager, state) => 5 > manager.getDistance(state.action.flag),
        trueCondition: "closeFlag",
        falseCondition: "farGoal"
    }

    closeFlag = {
        exec(_, state) {
            state.next = 1
            state.action = state.sequence[state.next]
        },
        next: "root" //was "rootNext"
    }

    farGoal = {
        condition: (manager, state) => manager.getAngle(state.action.flag) > 4,
        trueCondition: "rotateToGoal",
        falseCondition: "runToGoal"
    }

    rotateToGoal = {
        exec(manager, state) {state.command = {n: "turn", v: manager.getAngle(state.action.flag)}},
        next: "sendCommand"
    }

    runToGoal = {
        exec(_, state) {state.command = {n: "dash", v: 100}}, //was 100
        next: "sendCommand"
    }

    ballSeek = {
        condition: (_, state) => state.catched,
        trueCondition: "isRealCatched",
        falseCondition: "checkBallDistance"
    }

    isRealCatched = {
        condition: (manager, state) => 0.5 > manager.getDistance(state.action.goal),
        trueCondition: "manageCatched",
        falseCondition: "fakeCatch"
    }

    manageCatched = {
        condition: (manager, state) => manager.getVisible(state.action.goal),
        trueCondition: "ballGoalVisible",
        falseCondition: "rotate"
    }

    fakeCatch = {
        exec(_, state) {state.catched = false},
        next: "root"
    }

    checkBallDistance = {
        condition: (manager, state) => 15 > manager.getDistance(state.action.flag),
        trueCondition: "closeBall",
        falseCondition: "rotateToGoal"
    }

    closeBall = {
        condition: (manager, state) => 1 > manager.getDistance(state.action.flag),
        trueCondition: "secondCloseBall",
        falseCondition: "farGoal"
    }

    secondCloseBall = {
        condition: (manager, state) => 0.5 > manager.getDistance(state.action.flag),
        trueCondition: "manageKicks",
        falseCondition: "checkForCatch"
    }

    checkForCatch = {
        condition: (manager, state) => {
            let agentPosition = manager.getPosition()
            return (agentPosition == null) || ((agentPosition.x >= 40) && (Math.abs(agentPosition.y) <= 20))
        },
        trueCondition: "catch",
        falseCondition: "runToKick"
    }

    catch = {
        exec(manager, state) {
            state.catched = true
            state.command = {n: "catch", v: manager.getAngle(state.action.flag)}},
        next: "sendCommand"
    }

    runToKick = {
        condition: (manager, state) => 0.5 > manager.getDistance(state.action.flag),
        trueCondition: "manageKicks",
        falseCondition: "farGoal"
    }

    manageKicks = {
        condition: (manager, state) => manager.getVisible(state.action.goal),
        trueCondition: "ballGoalVisible",
        falseCondition: "ballGoalInvinsible"
    }

    ballGoalVisible = {
        exec(_, state) {
            state.catched = false
            state.next = 0
            state.action = state.sequence[state.next]
            state.command = {n: "kick", v: "70 15"}
        },
        next: "sendCommand"
    }

    ballGoalInvinsible = {
        exec(_, state) {state.command = {n: "kick", v: "10 45"}},
        next: "sendCommand"
    }
    
    sendCommand = {
        command: (_, state) => state.command
    }
}

module.exports = goalie