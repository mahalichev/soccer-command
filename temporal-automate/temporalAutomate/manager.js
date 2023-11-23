const Taken = require('./taken')
const DEBUG = false

class Manager {
    constructor() {
        this.taken = new Taken()
    }

    setHear(input) {
        Taken.setHear(input)
    }

    getAction(input, temporalAutomate, team, side) {
        let taken = this.taken.setSee(input, team, side)
        this.increaseTimers(taken, temporalAutomate)
        if (temporalAutomate.actions["beforeAction"])
            temporalAutomate.actions["beforeAction"](taken, temporalAutomate.state)
        return this.execute(taken, temporalAutomate)
    }

    increaseTimers(taken, temporalAutomate) {
        if (!this.lastTime)
            this.lastTime = 0
        if (taken.time > this.lastTime) {
            this.lastTime = taken.time
            for (let key in temporalAutomate.state.timers)
                temporalAutomate.state.timers[key] = temporalAutomate.state.timers[key] + 1
        }
    }

    execute(taken, temporalAutomate) {
        if (DEBUG) console.log("execute", temporalAutomate.current,  temporalAutomate.state)
        if (temporalAutomate.state.synch) {
            let condition = temporalAutomate.state.synch.substr(0, temporalAutomate.state.synch.length - 1)
            if (DEBUG) console.log("synch", condition)
            return temporalAutomate.actions[condition](taken, temporalAutomate.state)
        }
        if (temporalAutomate.state.next) {
            if (temporalAutomate.nodes[temporalAutomate.current])
                return this.nextState(taken, temporalAutomate)
            if (temporalAutomate.edges[temporalAutomate.current])
                return this.nextEdge(taken, temporalAutomate)
        }
        if (temporalAutomate.nodes[temporalAutomate.current])
            return this.executeState(taken, temporalAutomate)
        if (temporalAutomate.edges[temporalAutomate.current])
            return this.executeEdge(taken, temporalAutomate)
    }

    nextState(taken, temporalAutomate) {
        let node = temporalAutomate.nodes[temporalAutomate.current]
        if (DEBUG) console.log("nextState", temporalAutomate.current)
        for (let name of node.edges) {
            let edgeName = `${node.name}_${name}`
            let edge = temporalAutomate.edges[edgeName]
            if (!edge) throw `Unexpected edge ${node.name}_${name}`

            for (let e of edge) {
                if (e.guard) {
                    let guard = true
                    for (let g of e.guard)
                        if (!this.guard(taken, temporalAutomate, g)) {
                            guard = false
                            break
                        }
                    if (!guard)
                        continue
                }

                if (e.synch) {
                    if (e.synch.endsWith("?")) {
                        let condition = e.synch.substr(0, e.synch.length - 1)
                        if (!temporalAutomate.actions[condition])
                            throw `Unexpected synch ${e.synch}`
                        if (!temporalAutomate.actions[condition](taken, temporalAutomate.state))
                            continue
                    }
                }
                temporalAutomate.current = edgeName
                temporalAutomate.state.next = false
                return this.execute(taken, temporalAutomate)
            }
        }
    }

    nextEdge(taken, temporalAutomate) {
        let arr = temporalAutomate.current.split("_")
        let node = arr[1]
        if (DEBUG) console.log("nextEdge", temporalAutomate.current)
        temporalAutomate.current = node
        temporalAutomate.state.next = false
        return this.execute(taken, temporalAutomate)
    }

    executeState(taken, temporalAutomate) {
        let node = temporalAutomate.nodes[temporalAutomate.current]
        if (DEBUG) console.log("executeState", temporalAutomate.current)
        if (temporalAutomate.actions[node]) {
            let action = temporalAutomate.actions[node](taken, temporalAutomate.state)
            if (!action && temporalAutomate.state.next) return this.execute(taken, temporalAutomate)
            return action
        } else {
            temporalAutomate.state.next = true
            return this.execute(taken, temporalAutomate)
        }
    }

    executeEdge(taken, temporalAutomate) {
        let edges = temporalAutomate.edges[temporalAutomate.current]
        if (DEBUG) console.log("executeEdge", temporalAutomate.current)
        for (let edge of edges) {
            if (edge.guard) {
                let guard = true
                for (let g of edge.guard)
                    if (!this.guard(taken, temporalAutomate, g)) {
                        guard = false
                        break
                    }
                if (!guard) continue
            }

            if (edge.assign) {
                for (let assign of edge.assign) {
                    if (assign.type == "timer") {
                        if (!temporalAutomate.state.timers[assign.name] && (temporalAutomate.state.timers[assign.name] != 0))
                            throw `Unexpected timer: ${assign}`
                        temporalAutomate.state.timers[assign.name] = assign.value
                    } else {
                        if (!temporalAutomate.state.variables[assign.name] && (temporalAutomate.state.variables[assign.name] != 0))
                            throw `Unexpected variable: ${assign}`
                        temporalAutomate.state.variables[assign.name] = assign.value
                    }
                }
            }

            if (edge.synch) {
                if (!edge.synch.endsWith("?") && !edge.synch.endsWith("!"))
                    throw `Unexpected synch: ${edge.synch}`

                if (edge.synch.endsWith("!")) {
                    let condition = edge.synch.substr(0, edge.synch.length - 1)
                    if (!temporalAutomate.actions[condition])
                        throw `Unexpected synch: ${edge.synch}`
                    return temporalAutomate.actions[condition](taken, temporalAutomate.state)
                }
            }
        }

        temporalAutomate.state.next = true
        return this.execute(taken, temporalAutomate)
    }

    guard(taken, temporalAutomate, g) {
        if (DEBUG) console.log("guard", g)
        function temporalAutomateStateObject(obj, temporalAutomate) {
            if (typeof obj == "object")
                return obj.variable ? temporalAutomate.state.variables[obj.variable]
                                    : temporalAutomate.state.timers[obj.timer]
            else return obj
        }

        const operations = {
            lt(temporalAutomate, left, right) {
                return temporalAutomateStateObject(left, temporalAutomate) < temporalAutomateStateObject(right, temporalAutomate)
            },

            lte(temporalAutomate, left, right) {
                return temporalAutomateStateObject(left, temporalAutomate) <= temporalAutomateStateObject(right, temporalAutomate)
            }
        }

        if (!operations[g.symbol]) throw `Unexpected guard: ${JSON.stringify(g)}`
        return operations[g.symbol](temporalAutomate, g.left, g.right)
    }
}

module.exports = Manager