class Racer {
    config;
    players;

    constructor() {
        this.initConfig();
        this.initPlayers();
        this.initListeners();
        this.setPlayersNames();
        this.drawBackground();
    }

    initConfig() {
        const bg = document.getElementById("background");
        this.config = {
            angleIncrement: -10,
            lineLength: 10,
            lineWidth: 2,
            speed: 30,
            eventTarget: new EventTarget(),
            leapEvent: new Event("leap"),
            isRunning: false,
            canvas: {
                background: bg,
                a: document.getElementById("canvasA"),
                b: document.getElementById("canvasB"),
                c: document.getElementById("canvasC"),
                d: document.getElementById("canvasD"),
                center: {
                    x: bg.width / 2,
                    y: bg.height / 2,
                }
            },
            track: null,
        };
    }

    initPlayers() {
        this.players = {
            a: {
                id: 0,
                name: '---',
                key: 'z',
                startPosition: {
                    x: this.config.canvas.center.x,
                    y: this.config.canvas.center.y + 50,
                },
                x: this.config.canvas.center.x,
                y: this.config.canvas.center.y + 50,
                color: '#66FF66',
                leap: 0,
                angle: 0,
                isTurnLeft: false,
                step: 0,
                ui: {
                    canvas: this.config.canvas.a,
                    ctx: this.config.canvas.a.getContext("2d"),
                    stats: document.querySelector('#playerA'),
                }

            },
            b: {
                id: 1,
                name: '---',
                key: 'm',
                startPosition: {
                    x: this.config.canvas.center.x,
                    y: this.config.canvas.center.y + 75,
                },
                x: this.config.canvas.center.x,
                y: this.config.canvas.center.y + 75,
                color: '#6AF',
                leap: 0,
                angle: 0,
                isTurnLeft: false,
                step: 0,
                ui: {
                    canvas: this.config.canvas.b,
                    ctx: this.config.canvas.b.getContext("2d"),
                    stats: document.querySelector('#playerB'),
                }
            },
            c: {
                id: 2,
                name: '---',
                key: 'ArrowLeft',
                startPosition: {
                    x: this.config.canvas.center.x,
                    y: this.config.canvas.center.y + 100,
                },
                x: this.config.canvas.center.x,
                y: this.config.canvas.center.Y + 100,
                color: '#F66',
                leap: 0,
                angle: 0,
                isTurnLeft: false,
                step: 0,
                ui: {
                    canvas: this.config.canvas.c,
                    ctx: this.config.canvas.c.getContext("2d"),
                    stats: document.querySelector('#playerC'),
                }
            },
            d: {
                id: 3,
                name: '---',
                key: 'Enter',
                startPosition: {
                    x: this.config.canvas.center.x,
                    y: this.config.canvas.center.y + 125,
                },
                x: this.config.canvas.center.x,
                y: this.config.canvas.center.y + 125,
                color: '#FF6',
                leap: 0,
                angle: 0,
                isTurnLeft: false,
                step: 0,
                ui: {
                    canvas: this.config.canvas.d,
                    ctx: this.config.canvas.d.getContext("2d"),
                    stats: document.querySelector('#playerD'),
                }
            },
        };
    }

    initListeners() {
        document.addEventListener('keydown', (event) => this.handleKeyPress(event, true));
        document.addEventListener('keyup', (event) => this.handleKeyPress(event, false))
        this.config.eventTarget.addEventListener("leap", e => e.data.ui.stats.querySelector(".leap").innerHTML = e.data.leap);
    }

    drawEdge(radius = 30, distance = 100) {
        const x = this.config.canvas.background.width / 2;
        const y = this.config.canvas.background.height / 2;
        const ctx = this.config.canvas.background.getContext("2d");
        const startAngle1 = Math.PI * 0.5;
        const endAngle1 = Math.PI * 1.5;
        const startAngle2 = Math.PI * 1.5;
        const endAngle2 = Math.PI * 0.5;
        const adjustedDistance = radius + distance;
        const x1 = x - adjustedDistance;
        const x2 = x + adjustedDistance;

        ctx.beginPath();
        ctx.arc(x1, y, radius, startAngle1, endAngle1);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x1, y - radius);
        ctx.lineTo(x2, y - radius);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x2, y, radius, startAngle2, endAngle2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x2, y + radius);
        ctx.lineTo(x1, y + radius);
        ctx.stroke();

        return {
            x1: x1,
            x2: x2,
            y: y,
            radius: radius,
            distance: distance,
            isInside: function (x, y) {
                const isInsideFirstHalfCircle = Math.pow(x - this.x1, 2) + Math.pow(y - this.y, 2) <= Math.pow(this.radius, 2);
                const isInsideSecondHalfCircle = Math.pow(x - this.x2, 2) + Math.pow(y - this.y, 2) <= Math.pow(this.radius, 2);
                const isInsideLine = x >= this.x1 && x <= this.x2 && y >= this.y - this.radius && y <= this.y + this.radius;

                return isInsideFirstHalfCircle || isInsideSecondHalfCircle || isInsideLine;
            }
        };
    }

    drawTrack() {
        const inner = this.drawEdge(30, 100);
        const outer = this.drawEdge(160, 40);

        return {
            inner,
            outer,
            isInside: function (x, y) {
                return this.outer.isInside(x, y) && !this.inner.isInside(x, y);
            },
        }
    }

    drawFinishLine(track) {
        const ctx = this.config.canvas.background.getContext("2d");
        const y1 = track.inner.y + track.inner.radius;
        const y2 = track.outer.y + track.outer.radius;

        ctx.beginPath();
        ctx.moveTo(this.config.canvas.center.x, y1);
        ctx.lineTo(this.config.canvas.center.x, y2);
        ctx.stroke();

        return {x1: this.config.canvas.center.x, y1, x2: this.config.canvas.center.x, y2};
    }

    drawBackground() {
        this.config.track = this.drawTrack();
        this.drawFinishLine(this.config.track);
    }

    run(player) {
        return new Promise(resolve => {
            if (player.isTurnLeft) {
                player.angle += this.config.angleIncrement * (Math.PI / 180);
            }

            const x1 = player.x;
            const y1 = player.y;
            const x2 = player.x = player.x + this.config.lineLength * Math.cos(player.angle);
            const y2 = player.y = player.y + this.config.lineLength * Math.sin(player.angle);

            if (x2 < this.config.canvas.center.x && player.leap % 1 === 0) {
                player.leap += 0.5;
                this.config.leapEvent.data = player;
                this.config.eventTarget.dispatchEvent(this.config.leapEvent);
            }

            if (x2 > this.config.canvas.center.x && player.leap % 1 !== 0) {
                player.leap += 0.5;
                this.config.leapEvent.data = player;
                this.config.eventTarget.dispatchEvent(this.config.leapEvent);
                player.ui.ctx.clearRect(0, 0, player.ui.canvas.width, player.ui.canvas.height);
            }


            player.step++;
            this.drawPath(x1, y1, x2, y2, player);

            resolve(player);
        });
    }

    runAll(race) {
        if (race.length !== 0) {
            this.config.isRunning = true;
        } else {
            this.config.isRunning = false;
            console.log('The race is over');

            return;
        }

        Promise.all(race).then((results) => {
            race.length = 0;
            results.forEach(player =>
                this.config.track.isInside(player.x, player.y)
                    ? race.push(this.run(player))
                    : console.log(`Player ${player.name} crashed in leap ${player.leap}!`)
            );

            setTimeout(() => requestAnimationFrame(() => this.runAll(race)), 1000 / this.config.speed);

        }).catch((error) => console.error(error));
    }

    drawPath(x1, y1, x2, y2, player) {
        player.ui.ctx.beginPath();
        player.ui.ctx.moveTo(x1, y1);
        player.ui.ctx.lineTo(x2, y2);
        player.ui.ctx.strokeStyle = player.color;
        player.ui.ctx.lineLength = this.config.lineLength;
        player.ui.ctx.lineWidth = this.config.lineWidth;
        player.ui.ctx.stroke();
    }

    handleKeyPress(event, isKeyDown) {
        if (!this.config.isRunning && event.key === 'Escape') {
            console.log('restart');
            this.setPlayersNames();
            this.restart();
        }

        if (!this.config.isRunning && event.key === ' ') {
            this.restart();
            const race = [];

            for (const k in this.players) {
                if (this.players.hasOwnProperty(k) && this.players[k].name !== '---') {
                    race.push(this.run(this.players[k]));
                }
            }

            this.runAll(race);
        }

        for (const k in this.players) {
            if (this.players.hasOwnProperty(k) && event.key === this.players[k].key) {
                this.players[k].isTurnLeft = isKeyDown;
            }
        }
    }

    setStats() {
        for (const k in this.players) {
            if (this.players.hasOwnProperty(k)) {
                const player = this.players[k];
                const name = player.ui.stats.querySelector(".name");
                const key = player.ui.stats.querySelector(".key");
                const color = player.ui.stats.querySelector(".color");
                const leap = player.ui.stats.querySelector(".leap");

                name.innerHTML = player.name;
                name.style.cursor = 'default';

                key.innerHTML = player.key;
                key.style.cursor = 'pointer';
                key.onclick = () => this.setKey(player);

                color.style.backgroundColor = player.color;
                color.style.cursor = 'pointer';
                color.onclick = () => this.setColor(player);

                leap.innerHTML = player.leap;
                leap.style.cursor = 'default';

                if (player.name === '---') {
                    player.ui.stats.style.display = 'none';
                } else {
                    player.ui.stats.style.display = 'block';
                }
            }
        }
    }

    showColorPicker() {
        return new Promise(function (resolve) {
            const input = document.createElement('input');
            input.type = 'color';
            input.addEventListener('change', function (event) {
                const selectedColor = event.target.value;
                resolve(selectedColor);
            });
            input.click();
        });
    }

    setName(player) {
        const result = prompt(`Podaj imię gracza numer ${player.id + 1}`, player.name);
        if (result !== '' && result !== null && result !== undefined) {
            player.name = result;
            this.setStats();
        }
    }

    setKey(player) {
        const result = prompt(`Podaj klawisz ruchu dla ${player.name}`, player.key);
        if (result !== '' && result !== null && result !== undefined) {
            player.key = result;
        }
        this.setStats();
    }

    setColor(player) {
        this.showColorPicker().then(color => {
            player.color = color;
            this.setStats();
        });
    }

    restart() {
        for (const k in this.players) {
            if (this.players.hasOwnProperty(k)) {
                const player = this.players[k];
                player.x = player.startPosition.x;
                player.y = player.startPosition.y;
                player.angle = 0;
                player.leap = 0;
                player.step = 0;
                player.isTurnLeft = false;
                player.ui.ctx.clearRect(0, 0, player.ui.canvas.width, player.ui.canvas.height);
            }
        }
        this.setStats();
    }

    setPlayersNames() {
        for (const k in this.players) {
            if (this.players.hasOwnProperty(k)) {
                this.setName(this.players[k]);
            }
        }
    }
}
