const Taken = require('./taken')

class ControllerLow {
    execute(input, heared, id, team, side, controllers) {
        const next = controllers[0]
        this.taken = Taken.setSee(input, heared, id, team, side)
        if (this.taken.ball && (this.taken.ball.distance < 0.5))
            this.taken.canKick = true
        else
            this.taken.canKick = false
        if (this.taken.ball && (this.taken.ball.distance < 1) &&
            (
                (this.taken.position && (Math.abs(this.taken.position.x) >= 38) && (Math.abs(this.taken.position.y <= 18))) ||
                (this.taken.ball.x && (Math.abs(this.taken.ball.x) >= 38) && (Math.abs(this.taken.ball.y <= 18)))
            )
        )
            this.taken.canCatch = true
        else
            this.taken.canCatch = false
        if (next)
            return next.execute(this.taken, controllers.slice(1))
    }
}

module.exports = ControllerLow