const WAIT_TICKS = 3
const PREDICTING_TICKS = 18

class passer {
    state = {
        next: 0,
        team: "LeftTeam",
        teammate: null,
        playing: false,
        needToSay: false,
        initCoordinates: "-10 -10",
        beforeInfo: null,
        afterInfo: null,
        toWait: WAIT_TICKS,
        sequence: [
            {
                act: "flag",
                flag: "fplc"
            }, {
                act: "kick",
                flag: "b"
            }, {
                act: "flag",
                flag: "unknown"
            }],
        command: null
    }

    root = {
        exec(_, state) {
            state.action = state.sequence[state.next]
            state.command = null
            state.teammate = null
        },
        next: "playing"
    }

    playing = {
        condition: (_, state) => state.playing,
        trueCondition: "needToSay",
        falseCondition: "atInitCoordinates"
    }

    atInitCoordinates = {
        exec(_, state) {
            state.next = 0
            state.command = {n: "move", v: state.initCoordinates}
        },
        next: "sendCommand"
    }

    needToSay = {
        condition: (_, state) => state.needToSay,
        trueCondition: "say",
        falseCondition: "goalVisible"
    }

    say = {
        exec(_, state) {
            state.command = {n: "say", v: "go"}
            state.needToSay = false
        },
        next: "sendCommand"
    }

    goalVisible = {
        condition: (manager, state) => manager.getVisible(state.action.flag),
        trueCondition: "rootNext",
        falseCondition: "rotate"
    }

    rotate = {
        exec(_, state) {state.command = {n: "turn", v: -55}
                        state.beforeInfo = null
                        state.afterInfo = null
                        state.toWait = WAIT_TICKS},
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
        },
        next: "root"
    }

    farGoal = {
        condition: (manager, state) => Math.abs(manager.getAngle(state.action.flag)) > 4,
        trueCondition: "rotateToGoal",
        falseCondition: "runToGoal"
    }

    rotateToGoal = {
        exec(manager, state) {state.command = {n: "turn", v: manager.getAngle(state.action.flag)}
                              state.beforeInfo = null
                              state.afterInfo = null
                              state.toWait = WAIT_TICKS},
        next: "sendCommand"
    }

    runToGoal = {
        exec(_, state) {state.command = {n: "dash", v: 70}
                        state.beforeInfo = null
                        state.afterInfo = null
                        state.toWait = WAIT_TICKS},
        next: "sendCommand"
    }

    ballSeek = {
        condition: (manager, state) => 0.5 > manager.getDistance(state.action.flag),
        trueCondition: "findTeammate",
        falseCondition: "farGoal"
    }

    findTeammate = {
        exec(manager, state) {
            let teammates = manager.getTeammates(state.team)
            if (teammates.length > 0) state.teammate = teammates[0]
        },
        next: "closeBall"
    }

    closeBall = {
        condition: (_, state) => state.teammate != null,
        trueCondition: "ballGoalVisible",
        falseCondition: "ballGoalInvinsible"
    }

    ballGoalVisible = {
        condition: (_, state) => state.beforeInfo == null,
        trueCondition: "saveBefore",
        falseCondition: "waiting"
    }

    saveBefore = {
        exec(manager, state) {state.beforeInfo = {distance: manager.getDistance(state.teammate),
                                                  angle: manager.getAngle(state.teammate)}
        },
        next: "sendCommand"
    }

    waiting = {
        condition: (_, state) => --state.toWait == 0,
        trueCondition: "saveAfter",
        falseCondition: "sendCommand"
    }

    saveAfter = {
        exec(manager, state) {state.afterInfo = {distance: manager.getDistance(state.teammate),
                                                 angle: manager.getAngle(state.teammate)}
        },
        next: "doPass"
    }

    doPass = {
        exec(manager, state) {
            let passInfo = manager.getPass(state.beforeInfo, state.afterInfo, WAIT_TICKS, PREDICTING_TICKS)
            state.command = {n: "kick", v: `${(passInfo.distance * 3) < 100 ? passInfo.distance * 3 : 100} ${passInfo.angle}`}
            state.needToSay = true
            state.beforeInfo = null
            state.afterInfo = null
            state.toWait = WAIT_TICKS
            state.next++
        },
        next: "sendCommand"
    }

    ballGoalInvinsible = {
        exec(_, state) {state.command = {n: "kick", v: "10 45"}
                        state.beforeInfo = null
                        state.afterInfo = null
                        state.toWait = WAIT_TICKS},
        next: "sendCommand"
    }

    sendCommand = {
        command: (_, state) => state.command
    }
}

module.exports = passer