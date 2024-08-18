/*
 * Copyright (c) 2024 Tero Jäntti, Sami Heikkinen
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use, copy,
 * modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
 * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { Character } from "./Character";
import { isInsideRectangle } from "./geometry";
import { cx } from "./graphics";
import { getKeys } from "./keyboard";
import { normalize, Vector } from "./Vector";

const trackWidth = 100;

export class Level {
    private track: Vector[] = [
        { x: 100, y: 600 },
        { x: 100, y: 100 },
        { x: 700, y: 100 },
        { x: 700, y: 400 },
    ];

    private characters: Character[] = [];
    private player: Character;

    public get progress(): string {
        return (
            this.player.waypoint.toString() + " / " + (this.track.length - 1)
        );
    }

    constructor() {
        this.player = new Character(this.track[0]);
        this.characters.push(this.player);
    }

    update(t: number, dt: number): void {
        for (let i = 0; i < this.characters.length; i++) {
            const c = this.characters[i];

            const movement =
                c === this.player ? this.getPlayerMovement() : { x: 0, y: 0 };
            c.move(movement);

            this.checkProgress(c);

            c.update(t, dt);
        }
    }

    private getPlayerMovement(): Vector {
        const keys = getKeys();

        const left = keys.ArrowLeft || keys.KeyA;
        const right = keys.ArrowRight || keys.KeyD;
        const up = keys.ArrowUp || keys.KeyW;
        const down = keys.ArrowDown || keys.KeyS;

        const dx = left ? -1 : right ? 1 : 0;
        const dy = up ? -1 : down ? 1 : 0;

        if (dx === 0 && dy === 0) {
            return { x: 0, y: 0 };
        }

        return normalize({
            x: dx,
            y: dy,
        });
    }

    draw(t: number, dt: number): void {
        const first = this.track[0];

        cx.save();
        cx.strokeStyle = "rgb(70,50,70)";
        cx.lineWidth = trackWidth;
        cx.beginPath();
        cx.moveTo(first.x, first.y);
        for (let i = 1; i < this.track.length; i++) {
            const p = this.track[i];
            cx.lineTo(p.x, p.y);
        }
        cx.stroke();

        cx.fillStyle = "rgb(40, 120, 40)";
        cx.fillRect(
            first.x - trackWidth / 2,
            first.y - trackWidth / 2,
            trackWidth,
            trackWidth,
        );

        for (let i = 1; i < this.track.length; i++) {
            const p = this.track[i];
            cx.fillStyle = "rgb(120, 40, 40)";
            cx.fillRect(
                p.x - trackWidth / 2,
                p.y - trackWidth / 2,
                trackWidth,
                trackWidth,
            );
        }
        cx.restore();

        for (let i = 0; i < this.characters.length; i++) {
            const c = this.characters[i];
            c.draw(t, dt);
        }
    }

    checkProgress(c: Character): void {
        if (c.waypoint >= this.track.length - 1) {
            return;
        }

        const nextWayPointIndex = c.waypoint + 1;
        const waypoint = this.track[nextWayPointIndex];

        if (isInsideRectangle(c, waypoint, trackWidth / 2)) {
            c.waypoint += 1;
        }
    }
}
