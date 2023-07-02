class Racer {
    config;
    players = [];

    constructor(newGame = false) {
        this.initConfig();
        this.initPlayers();
        this.initListeners();
        if (newGame) {
            this.createGame().then();
        }
        this.drawBackground();
    }

    initConfig() {
        const background = document.getElementById("background");
        const pressToStart = document.getElementById('pressToStart');
        const pressToCreate = document.getElementById('pressToCreate');
        const canvasA = document.getElementById("canvasA");
        const canvasB = document.getElementById("canvasB");
        const canvasC = document.getElementById("canvasC");
        const canvasD = document.getElementById("canvasD");


        this.config = {
            angleIncrement: -10,
            speed: 3,
            lineWidth: 2,
            frameSpeed: 30,
            eventTarget: new EventTarget(),
            event: {
                leap: new Event('leap'),
                playersChanged: new Event('playersChanged'),
            },
            isRunning: false,
            background: {
                canvas: background,
                ctx: background.getContext("2d"),
                center: {
                    x: background.width / 2,
                    y: background.height / 2,
                }
            },
            track: null,
            html: {
                pressToStart,
                pressToCreate,
            },
            ui: [{
                canvas: canvasA,
                ctx: canvasA.getContext("2d"),
                stats: document.querySelector('#playerA'),
            }, {
                canvas: canvasB,
                ctx: canvasB.getContext("2d"),
                stats: document.querySelector('#playerB'),
            }, {
                canvas: canvasC,
                ctx: canvasC.getContext("2d"),
                stats: document.querySelector('#playerC'),
            }, {
                canvas: canvasD,
                ctx: canvasD.getContext("2d"),
                stats: document.querySelector('#playerD'),
            }]
        };
    }

    initPlayers() {
        this.players = [{
            id: 0,
            name: '',
            key: 'z',
            x: 0,
            y: 0,
            color: '#66FF66',
            leap: 0,
            angle: 0,
            isTurnLeft: false,
            step: 0,
            speed: 0,
        }, {
            id: 1,
            name: '',
            key: 'm',
            x: 0,
            y: 0,
            color: '#6AF',
            leap: 0,
            angle: 0,
            isTurnLeft: false,
            step: 0,
            speed: 0,
        }, {
            id: 2,
            name: '',
            key: 'ArrowLeft',
            x: 0,
            y: 0,
            color: '#F66',
            leap: 0,
            angle: 0,
            isTurnLeft: false,
            step: 0,
            speed: 0,
        }, {
            id: 3,
            name: '',
            key: 'ArrowRight',
            x: 0,
            y: 0,
            color: '#FF6',
            leap: 0,
            angle: 0,
            isTurnLeft: false,
            step: 0,
            speed: 0,
        }];
    }

    initListeners() {
        this.config.eventTarget.addEventListener('keydown', (event) => this.handleKeyPress(event, true));
        this.config.eventTarget.addEventListener('keyup', (event) => this.handleKeyPress(event, false))
        this.config.eventTarget.addEventListener('leap', event => {
            const player = event.data;
            this.config.ui[player.id].stats.querySelector(".leap").innerHTML = player.leap;
        });
    }

    drawEdge(radius = 30, distance = 100) {
        const x = this.config.background.center.x;
        const y = this.config.background.center.y;
        const ctx = this.config.background.ctx;
        const startAngle1 = Math.PI * 0.5;
        const endAngle1 = Math.PI * 1.5;
        const startAngle2 = Math.PI * 1.5;
        const endAngle2 = Math.PI * 0.5;
        const adjustedDistance = radius + distance;
        const x1 = x - adjustedDistance;
        const x2 = x + adjustedDistance;

        ctx.beginPath();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
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
        const ctx = this.config.background.ctx;
        const y1 = track.inner.y + track.inner.radius;
        const y2 = track.outer.y + track.outer.radius;

        ctx.beginPath();
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.moveTo(this.config.background.center.x, y1);
        ctx.lineTo(this.config.background.center.x, y2);
        ctx.stroke();

        return {x1: this.config.background.center.x, y1, x2: this.config.background.center.x, y2};
    }

    drawBackground() {
        this.config.track = this.drawTrack();
        this.drawFinishLine(this.config.track);
    }

    run(player) {
        return new Promise(resolve => {
            if (player.isTurnLeft) {
                player.angle += this.config.angleIncrement * (Math.PI / 180);
                player.step = 0;
            } else {
                player.step++;
            }

            const playerSpeed = this.config.speed + Math.floor(player.leap + 1);

            const x1 = player.x;
            const y1 = player.y;
            const x2 = player.x = player.x + playerSpeed * Math.cos(player.angle);
            const y2 = player.y = player.y + playerSpeed * Math.sin(player.angle);

            if (x2 < this.config.background.center.x && player.leap % 1 === 0) {
                player.leap += 0.5;
            }

            if (x2 > this.config.background.center.x && player.leap % 1 !== 0) {
                player.leap += 0.5;
                this.clearCanvas(player.id);
            }

            this.config.event.leap.data = player;
            this.config.eventTarget.dispatchEvent(this.config.event.leap);

            this.drawPath(x1, y1, x2, y2, player);

            resolve(player);
        });
    }

    runAll(race) {
        if (race.length !== 0) {
            this.config.isRunning = true;
        } else {
            this.config.isRunning = false;
            this.config.html.pressToStart.style.display = 'block';
            console.log('The race is over');

            return;
        }

        Promise.all(race).then((results) => {
            race.length = 0;
            results.forEach(player => {
                if (this.config.track.isInside(player.x, player.y)) {
                    race.push(this.run(player));
                } else {
                    this.clearCanvas(player.id)
                    console.log(`Player ${player.name} crashed in leap ${player.leap}!`);
                }
            });

            setTimeout(() => requestAnimationFrame(() => this.runAll(race)), 1000 / this.config.frameSpeed);

        }).catch((error) => console.error(error));
    }

    drawPath(x1, y1, x2, y2, player) {
        const ui = this.config.ui[player.id];

        ui.ctx.beginPath();
        ui.ctx.moveTo(x1, y1);
        ui.ctx.lineTo(x2, y2);
        ui.ctx.strokeStyle = player.color;
        ui.ctx.lineLength = this.config.speed;
        ui.ctx.lineWidth = this.config.lineWidth;
        ui.ctx.stroke();
    }

    clearCanvas(id) {
        const ui = this.config.ui[id];
        ui.ctx.clearRect(0, 0, ui.canvas.width, ui.canvas.height);
    }

    handleKeyPress(event, isKeyDown) {
        if (!this.config.isRunning && event.key === 'c') {
            console.log('restart');
            this.createGame().then(() => this.restart());
        }

        if (!this.config.isRunning && event.key === ' ') {
            this.restart();
            const race = [];

            this.players.forEach((player) => {
                if (player.name !== '') {
                    race.push(this.run(player));
                }
            });

            if (race.length > 0) {
                this.config.html.pressToStart.style.display = 'none';
                this.runAll(race);
            }
        }
        this.players.forEach((player) => {
            if (player.key === event.key) {
                player.isTurnLeft = isKeyDown;
            }
        });
    }

    setStats() {
        this.players.forEach((player) => {
            const stats = this.config.ui[player.id].stats;

            const name = stats.querySelector(".name");
            const key = stats.querySelector(".key");
            const color = stats.querySelector(".color");
            const leap = stats.querySelector(".leap");

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

            stats.style.display = player.name === '' ? 'none' : 'block';
        });
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
        const result = prompt(`Type player ${player.id + 1} name`, player.name);
        if (result !== null && result !== undefined) {
            player.name = result;
            this.setStats();
        }
    }

    setKey(player) {
        const result = prompt(`Set move key for ${player.name}`, player.key);
        if (result !== null && result !== undefined) {
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
        this.players.forEach((player) => {
            player.x = this.config.background.center.x;
            player.y = this.config.background.center.y + 50 + (player.id * 25);
            player.angle = 0;
            player.leap = 0;
            player.step = 0;
            player.speed = 0;
            player.isTurnLeft = false;
            this.clearCanvas(player.id);
        });

        this.setStats();

        const allPlayersSet = this.players.some(player => player.name !== '');

        this.config.html.pressToCreate.style.display = allPlayersSet ? 'none' : 'block';

        if (!racer.config.isRunning && allPlayersSet) {
            racer.config.html.pressToStart.style.display = 'block';
        } else {
            racer.config.html.pressToStart.style.display = 'none';
        }
    }

    createGame() {
        return new Promise((resolve) => {
            this.players.forEach((player) => this.setName(player));

            this.config.event.playersChanged.data = this.players;
            this.config.eventTarget.dispatchEvent(this.config.event.playersChanged);
            resolve();
        });
    }
}
