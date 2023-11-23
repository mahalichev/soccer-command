const Position = require('../position')

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
        if (possibleTeammates.length == 0) 
            possibleTeammates = this.parsedData.filter(data =>
                ((typeof(data)) == "object") && ((data.cmd.p.join("") == "p")))
        let result = []
        for (let teammate of possibleTeammates) {
            result.push(teammate.cmd.p.join(""))
        }
        return result
    },
    
    getPosition() {
        let flagsInSight = this.parsedData.filter(data =>
            ((typeof(data)) == "object") && ['f', 'g'].includes(data.cmd.p[0]))
        let flags = Position.parseFlags(flagsInSight)
        return Position.calculateAgentPosition(flags)
    }
}