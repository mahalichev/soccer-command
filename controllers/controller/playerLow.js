const Taken = require('./taken')

class ControllerLow {
    execute(input, heard, id, team, side, controllers) {
        const next = controllers[0]
        this.taken = Taken.setSee(input, heard, id, team, side)
        if (this.taken.ball && (this.taken.ball.distance < 0.5))
            this.taken.canKick = true
        else
            this.taken.canKick = false
        if (next)
            return next.execute(this.taken, controllers.slice(1))
    }
}

module.exports = ControllerLow