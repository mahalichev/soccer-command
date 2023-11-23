const FlagsData = {
    ftl50: {x: -50, y: -39}, ftl40: {x: -40, y: -39},
    ftl30: {x: -30, y: -39}, ftl20: {x: -20, y: -39},
    ftl10: {x: -10, y: -39}, ft0: {x: 0, y: -39},
    ftr10: {x: 10, y: -39}, ftr20: {x: 20, y: -39},
    ftr30: {x: 30, y: -39}, ftr40: {x: 40, y: -39},
    ftr50: {x: 50, y: -39}, fbl50: {x: -50, y: 39},
    fbl40: {x: -40, y: 39}, fbl30: {x: -30, y: 39},
    fbl20: {x: -20, y: 39}, fbl10: {x: -10, y: 39},
    fb0: {x: 0, y: 39}, fbr10: {x: 10, y: 39},
    fbr20: {x: 20, y: 39}, fbr30: {x: 30, y: 39},
    fbr40: {x: 40, y: 39}, fbr50: {x: 50, y: 39},
    flt30: {x: -57.5, y: -30}, flt20: {x: -57.5, y: -20},
    flt10: {x: -57.5, y: -10}, fl0: {x: -57.5, y: 0},
    flb10: {x: -57.5, y: 10}, flb20: {x: -57.5, y: 20},
    flb30: {x: -57.5, y: 30}, frt30: {x: 57.5, y: -30},
    frt20: {x: 57.5, y: -20}, frt10: {x: 57.5, y: -10},
    fr0: {x: 57.5, y: 0}, frb10: {x: 57.5, y: 10},
    frb20: {x: 57.5, y: 20}, frb30: {x: 57.5, y: 30},
    fglt: {x: -52.5, y: -7.01}, fglb: {x: -52.5, y: 7.01},
    gl: {x: -52.5, y: 0}, gr: {x: 52.5, y: 0}, fc: {x: 0, y: 0},
    fplt: {x: -36, y: -20.15}, fplc: {x: -36, y: 0},
    fplb: {x: -36, y: 20.15}, fgrt: {x: 52.5, y: -7.01},
    fgrb: {x: 52.5, y: 7.01}, fprt: {x: 36, y: -20.15},
    fprc: {x: 36, y: 0}, fprb: {x: 36, y: 20.15},
    flt: {x: -52.5, y: -34}, fct: {x: 0, y: -34},
    frt: {x: 52.5, y: -34}, flb: {x: -52.5, y: 34},
    fcb: {x: 0, y: 34}, frb: {x: 52.5, y: 34},
    distance(p1, p2){
        return Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2)
    }
}

const LOGGABLE = false

module.exports = {
    processPosition(position){
        if ((position == null) ||
            Number.isNaN(position.x) ||
            Number.isNaN(position.y) ||
            (Math.abs(position.x) == Infinity) ||
            (Math.abs(position.y) == Infinity)) return null
        let x = Math.round(position.x * 100) / 100
        let y = Math.round(position.y * 100) / 100
        return {x: x, y: y}
    },

    getMinimalMistake(possibleX, possibleY, flag){
        if (LOGGABLE) console.log(" -d Checking minimal mistake", possibleX, possibleY, flag)
        if ((possibleX.length == 0) || (possibleY.length == 0)) return null
        let position = null
        let minimalMistake = Infinity
        possibleX.forEach(x => possibleY.forEach(y => {
            let mistake = Math.abs((x - flag.x)**2 + (y - flag.y)**2 - flag.distance**2)
            if ((minimalMistake > mistake) && (Math.abs(x) <= 54) && (Math.abs(y) <= 32)) {
                minimalMistake = mistake
                position = {x: x, y: y}
            }
        }))
        if (LOGGABLE) console.log(" -d Minimal mistake result", position)
        return position
    },

    getAlpha(flag1, flag2){
        return (flag1.y - flag2.y) / 
               (flag2.x - flag1.x)
    },

    getBeta(flag1, flag2){
        return (flag2.y**2 - flag1.y**2 + flag2.x**2 - flag1.x**2 + 
                flag1.distance**2 - flag2.distance**2) / (2 * (flag2.x - flag1.x))
    },

    getPositionEqualsX(flags, ind1, ind2){
        if (LOGGABLE) console.log(" -d Getting position with equals X", flags[ind1], flags[ind2])
        let y = (flags[ind2].y**2 - flags[ind1].y**2 + 
                 flags[ind1].distance**2 - flags[ind2].distance**2) /
                 (2 * (flags[ind2].y - flags[ind1].y))

        let valueToSqrt = flags[ind1].distance**2 - (y - flags[ind1].y)**2
        if (valueToSqrt < 0) return null
        let possibleX = [flags[ind1].x + Math.sqrt(valueToSqrt),
                         flags[ind1].x - Math.sqrt(valueToSqrt)]

        if (flags.length > 2){
            let ind3 = [0, 1, 2].filter(i3 => ![ind1, ind2].includes(i3))[0]
            let position = this.getMinimalMistake(possibleX, [y], flags[ind3])
            return this.processPosition(position)
        }

        let position = {x: Math.abs(possibleX[1]) <= 54 ? possibleX[1] : possibleX[0], y: y}
        if (LOGGABLE) console.log(" -d Position with equals X result", position)
        return this.processPosition(position)
    },

    getPositionEqualsY(flags, ind1, ind2){
        if (LOGGABLE) console.log(" -d Getting position with equals Y", flags[ind1], flags[ind2])
        let x = this.getBeta(flags[ind1], flags[ind2])

        let valueToSqrt = flags[ind1].distance**2 - (x - flags[ind1].x)**2
        if (valueToSqrt < 0) return null
        let possibleY = [flags[ind2].y + Math.sqrt(valueToSqrt),
                         flags[ind2].y - Math.sqrt(valueToSqrt)]

        if (flags.length > 2){
            let ind3 = [0, 1, 2].filter(i3 => ![ind1, ind2].includes(i3))[0]
            let position = this.getMinimalMistake([x], possibleY, flags[ind3])
            return this.processPosition(position)
        }

        let position = {x: x, y: Math.abs(possibleY[1]) <= 32 ? possibleY[1] : possibleY[0]}
        if (LOGGABLE) console.log(" -d Position with equals Y result", position)
        return this.processPosition(position)
    },

    getPositionTwoFlags(flags){
        if (LOGGABLE) console.log(" -d Getting position with two flags", flags)
        if (flags[0].x == flags[1].x) return this.getPositionEqualsX(flags, 0, 1)
        if (flags[0].y == flags[1].y) return this.getPositionEqualsY(flags, 0, 1)

        let alpha = this.getAlpha(flags[0], flags[1])
        let beta = this.getBeta(flags[0], flags[1])

        let a = alpha**2 + 1
        let b = -2 * (alpha * (flags[0].x - beta) + flags[0].y)
        let c = (flags[0].x - beta)**2 + flags[0].y**2 - flags[0].distance**2
        let D = b**2 - 4 * a * c
        if (D < 0) return null

        let possibleY = [(-b + Math.sqrt(D)) / (2 * a),
                         (-b - Math.sqrt(D)) / (2 * a)]
        
        let valueToSqrt1 = Math.abs(flags[0].distance**2 - (possibleY[0] - flags[0].y)**2)
        let valueToSqrt2 = Math.abs(flags[0].distance**2 - (possibleY[1] - flags[0].y)**2)

        let possibleX = []
        if (valueToSqrt1 >= 0) possibleX.concat([flags[0].x + Math.sqrt(valueToSqrt1),
                                                 flags[0].x - Math.sqrt(valueToSqrt1)])
        if (valueToSqrt2 >= 0) possibleX.concat([flags[0].x + Math.sqrt(valueToSqrt2),
                                                 flags[0].x - Math.sqrt(valueToSqrt2)])

        let position = null
        possibleX.every((x, i) => {
            if ((Math.abs(x) <= 54) && (Math.abs(possibleY[Math.floor(i / 2)]) <= 32)){
                position = {x: x, y: possibleY[Math.floor(i / 2)]}
                return false
            }
        })
        if (LOGGABLE) console.log(" -d Position with two flags result", position)
        return this.processPosition(position)
    },

    getPositionThreeFlags(flags){
        if (LOGGABLE) console.log(" -d Getting position with three flags", flags[0], flags[1], flags[2])
        if (flags[0].x == flags[1].x) return this.getPositionEqualsX(flags, 0, 1)
        if (flags[0].x == flags[2].x) return this.getPositionEqualsX(flags, 0, 2)
        if (flags[1].x == flags[2].x) return this.getPositionEqualsX(flags, 1, 2)
        if (flags[0].y == flags[1].y) return this.getPositionEqualsY(flags, 0, 1)
        if (flags[0].y == flags[2].y) return this.getPositionEqualsY(flags, 0, 2)
        if (flags[1].y == flags[2].y) return this.getPositionEqualsY(flags, 1, 2)

        let alpha1 = this.getAlpha(flags[0], flags[1])
        let alpha2 = this.getAlpha(flags[0], flags[2])
        let beta1 = this.getBeta(flags[0], flags[1])
        let beta2 = this.getBeta(flags[0], flags[2])

        let y = (beta1 - beta2) / (alpha2 - alpha1)
        let x = alpha1 * y + beta1
        if (LOGGABLE) console.log(" -d Position with three flags result", {x: x, y: y})
        return this.processPosition({x: x, y: y})
    },

    parseFlags(flagsInSightInstance){
        let flagsInSight = flagsInSightInstance.map(flag => {return {...flag}})
        let flags = flagsInSight.map(flagInSight => {
            let id = flagInSight.cmd.p.join("")
            let position = FlagsData[id]
            position.distance = flagInSight.p[0]
            position.angle = flagInSight.p[1]
            position.id = id
            return position
        })
        return flags
    },

    transferFlags(objectToTransfer, flagsInstance){
        const toRadians = angle => (angle * Math.PI) / 180
        let flags = flagsInstance.map(flag => {return {...flag}})

        flags.map((flag) => {
            let cos = Math.cos(toRadians(Math.abs(objectToTransfer.p[1] - flag.angle)))
            flag.distance = Math.sqrt(Math.abs(objectToTransfer.p[0]**2 + flag.distance**2 -
                                               2 * objectToTransfer.p[0] * flag.distance * cos))
        })
        return flags
    },

    calculateAgentPosition(flagsInstance){
        let flags = flagsInstance.map(flag => {return {...flag}})
        if (flags.length < 2) return null
        if (flags.length == 2) return this.getPositionTwoFlags(flags)
        return this.getPositionThreeFlags(flags)
    },

    calculateObjectPosition(objectInSight, flagsInstance){
        let flags = flagsInstance.map(flag => {return {...flag}})
        let transferedFlags = this.transferFlags(objectInSight, flags)
        if (transferedFlags.length < 2) return null
        if (transferedFlags.length == 2)
            return this.getPositionTwoFlags(transferedFlags)
        return this.getPositionThreeFlags(transferedFlags)
    }
}