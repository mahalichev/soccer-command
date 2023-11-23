module.exports = {
    getAction(decisionTree, parsedData, loggable = false) {
        this.parsedData = parsedData

        function execute(manager, decisionTree, title) {
            if (loggable) console.log(title)
            const action = decisionTree[title]
            if (typeof action.exec == "function") {
                action.exec(manager, decisionTree.state)
                return execute(manager, decisionTree, action.next)
            }
            if (typeof action.condition == "function") {
                const condition = action.condition(manager, decisionTree.state)
                if (condition) return execute(manager, decisionTree, action.trueCondition)
                return execute(manager, decisionTree, action.falseCondition)
            }
            if (loggable) console.log("\n")
            if (typeof action.command == "function")
                return action.command(manager, decisionTree.state)
            throw new Error(`Unexpected node in decision tree: ${title}`)
        }

        return execute(this, decisionTree, "root")
    },

    getVisible(goal) {
        return (goal == 'p') ? typeof this.parsedData.find(data => (typeof data == "object") &&
                               ['p'].includes(data.cmd.p[0])) != "undefined"
                             : typeof this.parsedData.find(data => (typeof data == "object") &&
                               (data.cmd.p.join("") == goal)) != "undefined"
    },

    getDistance(goal) {
        let goalData = (goal == 'p') ? this.parsedData.find(data => (typeof data == "object") &&
                                       ['p'].includes(data.cmd.p[0]))
                                     : this.parsedData.find(data => (typeof data == "object") &&
                                       (data.cmd.p.join("") == goal))
        return (typeof goalData != "undefined") ? goalData.p[0] : null
    },

    getAngle(goal) {
        let goalData = (goal == 'p') ? this.parsedData.find(data => (typeof data == "object") &&
                                       ['p'].includes(data.cmd.p[0]))
                                     : this.parsedData.find(data => (typeof data == "object") &&
                                       (data.cmd.p.join("") == goal))
        return (typeof goalData != "undefined") ? goalData.p[1] : null
    },

    getTeammates(team) {
        let possibleTeammates = this.parsedData.filter(data =>
            ((typeof(data)) == "object") && data.cmd.p.join("").startsWith(`p"${team}"`))
        let result = []
        for (let teammate of possibleTeammates) {
            result.push(teammate.cmd.p.join(""))
        }
        return result
    },
    
    getPass(before, after, waitTicks, predictingTicks) {
        console.log("start tracing at", before, "end tracing at", after)
        const toRadians = angle => (angle * Math.PI) / 180
        const toDegrees = angle => (angle * 180) / Math.PI
        let N = predictingTicks / waitTicks
        let d1 = before.distance
        let d2 = after.distance
        let alpha = after.angle - before.angle
        let dX = Math.sqrt(d1**2 + d2**2 - 2 * d1 * d2 * Math.cos(toRadians(Math.abs(alpha))))
        let d = Math.sqrt((N + 1) * (N * dX**2 + d2**2) - N * d1**2)
        let beta = Math.acos((d2**2 + d**2 - N**2 * dX**2) / (2 * d * d2))
        console.log(`distance ${d}, beta ${toDegrees(beta)}`)
        let result = {distance: d,
                      angle: after.angle + Math.sign(alpha) * toDegrees(beta)}
        console.log("result", result)
        return result
    }
}