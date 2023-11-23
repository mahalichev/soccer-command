const Position = require('../position')

const Taken = {
    getObjects(objectsInSight, filter) {
        let objects = objectsInSight.filter(filter)
        let result = []
        for (let obj of objects)
            result.push({
                id: obj.cmd.p.join(""),
                distance: obj.p[0],
                angle: obj.p[1]
            })
        return result
    },

    getTeammatesIdentifiers(team) {
        let result = []
        team.forEach(teammate => {
            let identifierStartsFrom = teammate.id.lastIndexOf('"') + 1
            if (identifierStartsFrom > 0) {
                let identifier = teammate.id.substring(identifierStartsFrom)
                if (identifier != "") {
                    let newTeammateData = {...teammate}
                    newTeammateData.idx = identifier
                    result.push(newTeammateData)
                }
            }
        })
        return result
    },

    closest(name, objects, team) {
        let target = null
        objects.forEach(element => {
            if (element.id == name) target = element
        })
        
        if (target == null) return []

        let result = []
        team.forEach(member => {
            let newValue = {...member}
            if ((member.x != undefined) && (target.x != undefined))
                newValue.distance = Math.sqrt((target.x - member.x)**2 + (target.y - member.y)**2)
            else {
                let angle = (Math.abs(target.angle - member.angle) * Math.PI) / 180
                newValue.distance = Math.sqrt(target.distance**2 + member.distance**2 - 
                                              2 * target.distance * member.distance * Math.cos(angle))
            }
            result.push(newValue)
        })
        result = result.sort((first, second) => first.distance - second.distance)
        return result
    },

    setSee(input, heard, id, team, side) {
        let parsedSee = this.getObjects(input, (data) => typeof(data) == "object")
        let flags = {}

        parsedSee.forEach(element => {
            if (["f", "g"].includes(element.id[0])) flags[element.id] = element
        })

        let flagsInSight = Position.parseFlags(flags)
        let position = Position.calculateAgentPosition(flagsInSight)

        let ball = null
        let goalLeft = null
        let goalRight = null
        let objects = []
        let teamEnemy = []
        let teamOwn = []
        let topFlagsCount = 0
        let bottomFlagsCount = 0

        parsedSee.forEach(element => {
            if (element.id[0] != "f")
                if (element.id[0] == "g") {
                    element.id == "gl" ? goalLeft = element : goalRight = element
                } else {
                    let elementPosition = Position.calculateObjectPosition(element, flagsInSight)
                    let newValue = element
                    if (elementPosition != null) {
                        newValue.x = elementPosition.x
                        newValue.y = elementPosition.y
                    }
                    objects.push(element)
                    if (element.id == "b") ball = newValue
                    if (element.id[0] == "p") element.id.includes(team) ? teamOwn.push(element) : teamEnemy.push(element)
                }
            if (element.id.startsWith("ft")) topFlagsCount++
            if (element.id.startsWith("fb")) bottomFlagsCount++
        })

        let rotSign = 1
        if (position != null)
            (side == "l") ? (position.y < 0 ? -1 : 1) : 
                            (position.y < 0 ? 1 : -1)

        return {
            time: input[0],
            id: id,
            side: side,
            teamName: team,
            ball: ball,
            rotSign: rotSign,
            goalEnemy: (side == "l") ? goalRight : goalLeft,
            goalOwn: (side == "l") ? goalLeft : goalRight,
            flags: flags,
            objects: objects,
            position: position,
            teamEnemy: teamEnemy,
            teamOwn: teamOwn,
            heard: heard,
            closest: this.closest,
            getTeammatesIdentifiers: this.getTeammatesIdentifiers
        }
    }
}

module.exports = Taken