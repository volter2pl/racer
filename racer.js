class Racer {
    config;
    players = [];

    constructor(newGame = false) {
        this.initConfig();
        this.initListeners();
        if (newGame) {
            this.createGame().then();
        }
        this.drawBackground();
        this.initPlayers();
        this.setStatus(`Enjoy`);
    }

    initConfig() {
        const pressToStart = document.getElementById('pressToStart');
        const pressToCreate = document.getElementById('pressToCreate');
        const status = document.getElementById('status');
        const canvases = {
            background: document.getElementById("background"),
            a: document.getElementById("canvasA"),
            b: document.getElementById("canvasB"),
            c: document.getElementById("canvasC"),
            d: document.getElementById("canvasD"),
        };

        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                entry.target.width = entry.target.clientWidth;
                entry.target.height = entry.target.clientHeight;
                this.drawBackground();
            }
        });

        for (let name in canvases) {
            if (canvases.hasOwnProperty(name)) {
                resizeObserver.observe(canvases[name]);
            }
        }

        this.config = {
            angleIncrement: -10,
            speed: 3,
            lineWidth: 2,
            frameSpeed: 30,
            eventTarget: new EventTarget(),
            event: {
                status: new Event('status'),
                lap: new Event('lap'),
                playersChanged: new Event('playersChanged'),
            },
            isRunning: false,
            background: {
                canvas: canvases.background,
                ctx: canvases.background.getContext("2d"),
                center: {
                    x: canvases.background.clientWidth / 2,
                    y: canvases.background.clientHeight / 2,
                }
            },
            track: null,
            finishLine: null,
            html: {
                pressToStart,
                pressToCreate,
                status,
            },
            ui: [{
                canvas: canvases.a,
                ctx: canvases.a.getContext("2d"),
                stats: document.querySelector('#playerA'),
            }, {
                canvas: canvases.b,
                ctx: canvases.b.getContext("2d"),
                stats: document.querySelector('#playerB'),
            }, {
                canvas: canvases.c,
                ctx: canvases.c.getContext("2d"),
                stats: document.querySelector('#playerC'),
            }, {
                canvas: canvases.d,
                ctx: canvases.d.getContext("2d"),
                stats: document.querySelector('#playerD'),
            }]
        };
    }

    initPlayers() {
        const data = {name: '', x: 0, y: 0, lap: 0, angle: 0, isTurnLeft: false, step: 0, speed: 0};

        this.players = [
            {id: 0, color: '#6F6', key: 'z', ...data},
            {id: 1, color: '#6AF', key: 'm', ...data},
            {id: 2, color: '#F66', key: 'ArrowLeft', ...data},
            {id: 3, color: '#FF6', key: 'ArrowRight', ...data},
        ];
    }

    initListeners() {
        this.config.eventTarget.addEventListener('keydown', (event) => this.handleKeyPress(event, true));
        this.config.eventTarget.addEventListener('keyup', (event) => this.handleKeyPress(event, false))
        this.config.eventTarget.addEventListener('status', event => this.config.html.status.innerHTML = event.data);
        this.config.eventTarget.addEventListener('lap', event => {
            const player = event.data;
            this.config.ui[player.id].stats.querySelector(".lap").innerHTML = Math.floor(player.lap);
        });
    }

    drawEdge(inner) {
        let width = this.config.background.canvas.width;
        let height = this.config.background.canvas.height;
        const margin = !inner ? 20 : height/1.2;

        width -= margin;
        height -= margin;

        const radius = height /2;
        const x1 = radius + (margin/2);
        const x2 = width-radius + (margin/2);
        const y = (height/2) + (margin/2);

        const ctx = this.config.background.ctx;
        const startAngle1 = Math.PI * 0.5;
        const endAngle1 = Math.PI * 1.5;
        const startAngle2 = Math.PI * 1.5;
        const endAngle2 = Math.PI * 0.5;

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x1, y, radius, startAngle1, endAngle1);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x2, y, radius, startAngle2, endAngle2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x1, margin/2);
        ctx.lineTo(x2, margin/2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x1, height + (margin/2));
        ctx.lineTo(x2, height + (margin/2));
        ctx.stroke();

        return {
            x1, x2, y, radius,
            isInside: function (x, y) {
                const isInsideFirstHalfCircle = Math.pow(x - this.x1, 2) + Math.pow(y - this.y, 2) <= Math.pow(this.radius, 2);
                const isInsideSecondHalfCircle = Math.pow(x - this.x2, 2) + Math.pow(y - this.y, 2) <= Math.pow(this.radius, 2);
                const isInsideLine = x >= this.x1 && x <= this.x2 && y >= this.y - this.radius && y <= this.y + this.radius;

                return isInsideFirstHalfCircle || isInsideSecondHalfCircle || isInsideLine;
            }
        };
    }

    drawTrack() {
        const inner = this.drawEdge(true);
        const outer = this.drawEdge(false);

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
        const x = (track.inner.x1 + track.outer.x2) / 2;
        const y1 = track.inner.y + track.inner.radius;
        const y2 = track.outer.y + track.outer.radius;

        ctx.beginPath();
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.moveTo(Math.round(x), y1);
        ctx.lineTo(Math.round(x), y2);
        ctx.stroke();

        return {x, y1, y2};
    }

    drawBackground() {
        const bg = this.config.background;
        bg.ctx.clearRect(0, 0, bg.canvas.width, bg.canvas.height);

        this.config.track = this.drawTrack();
        this.config.finishLine = this.drawFinishLine(this.config.track);
    }

    run(player) {
        return new Promise(resolve => {
            if (player.isTurnLeft) {
                player.angle += this.config.angleIncrement * (Math.PI / 180);
                player.step = 0;
            } else {
                player.step++;
            }

            const playerSpeed = this.config.speed + Math.floor(player.lap + 1);

            const x1 = player.x;
            const y1 = player.y;
            const x2 = player.x = player.x + playerSpeed * Math.cos(player.angle);
            const y2 = player.y = player.y + playerSpeed * Math.sin(player.angle);

            if (x2 < this.config.background.center.x && player.lap % 1 === 0) {
                player.lap += 0.5;
            }

            if (x2 > this.config.background.center.x && player.lap % 1 !== 0) {
                player.lap += 0.5;
                const tmp = Math.floor(player.lap);
                const laps = tmp > 1 ? `${tmp} laps` : `${tmp} lap`
                this.setStatus(`${player.name} completed the ${laps}`);
                this.clearCanvas(player.id);
            }

            this.config.event.lap.data = player;
            this.config.eventTarget.dispatchEvent(this.config.event.lap);

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

            const max = Math.max(...this.players.map(player => player.lap));
            const winners = this.players
                .filter(player => player.lap === max)
                .map((player) => player.name);

            if (max < 1) {
                this.setStatus(`Race over! No winner this time.`);
            } else {
                const tmp = Math.floor(max);
                const laps = max >= 2 ? `${tmp} laps` : `${tmp} lap`;
                if (winners.length === 1) {
                    this.setStatus(`Race over! ${winners.pop()} is the winner, completing ${laps}. Congratulations!`);
                } else {
                    this.setStatus(`Race over! ${winners.join(', ')} are the winners, completing ${laps}. Congratulations!`);
                }
            }

            return;
        }

        Promise.all(race).then((results) => {
            race.length = 0;
            results.forEach(player => {
                if (this.config.track.isInside(player.x, player.y)) {
                    race.push(this.run(player));
                } else {
                    this.clearCanvas(player.id)
                    this.setStatus(`${player.name} crashed in lap ${Math.floor(player.lap)}!`);
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
        ui.ctx.lineWidth = this.config.lineWidth;
        ui.ctx.stroke();
    }

    clearCanvas(id) {
        const ui = this.config.ui[id];
        ui.ctx.clearRect(0, 0, ui.canvas.width, ui.canvas.height);
    }

    handleKeyPress(event, isKeyDown) {
        if (isKeyDown && !this.config.isRunning) {
            if (event.key === 'c') {
                this.createGame().then(() => this.restart());
            } else if (event.key === ' ') {
                this.restart();
                const race = [];

                this.players.forEach((player) => {
                    if (player.name !== '') {
                        race.push(this.run(player));
                    }
                });

                if (race.length > 0) {
                    this.setStatus('Race started!');
                    this.config.html.pressToStart.style.display = 'none';
                    this.runAll(race);
                }
            }
        }

        this.players.forEach((player) => {
            if (player.key === event.key) {
                player.isTurnLeft = isKeyDown;
            }
        });
    }

    setStatus(status) {
        this.config.event.status.data = status;
        this.config.eventTarget.dispatchEvent(this.config.event.status);
    }

    setStats() {
        this.players.forEach((player) => {
            const stats = this.config.ui[player.id].stats;

            const name = stats.querySelector(".name");
            const key = stats.querySelector(".key");
            const color = stats.querySelector(".color");
            const lap = stats.querySelector(".lap");

            name.innerHTML = player.name;
            name.style.cursor = 'default';

            key.innerHTML = player.key;
            key.style.cursor = 'pointer';
            key.onclick = () => this.setKey(player);

            color.style.backgroundColor = player.color;
            color.style.cursor = 'pointer';
            color.onclick = () => this.setColor(player);

            lap.innerHTML = player.lap;
            lap.style.cursor = 'default';

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

    playersPositions(x1, y1, x2, y2, count) {
        const incrementX = (x2 - x1) / count;
        const incrementY = (y2 - y1) / count;
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push({
                x: Math.round(x1 + i * incrementX),
                y: Math.round(y1 + i * incrementY),
            });
        }

        return result;
    }

    restart() {
        const positions = this.playersPositions(
            this.config.finishLine.x,
            this.config.finishLine.y1,
            this.config.finishLine.x,
            this.config.finishLine.y2,
            this.players.length + 1
        );

        this.players.forEach((player) => {
            player.x = positions[player.id + 1].x
            player.y = positions[player.id + 1].y
            player.angle = 0;
            player.lap = 0;
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
