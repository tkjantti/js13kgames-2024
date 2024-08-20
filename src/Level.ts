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

import { Area } from "./Area";
import { Camera } from "./Camera";
import { Character } from "./Character";
import { canvas, cx } from "./graphics";
import { getKeys } from "./keyboard";
import { normalize, Vector } from "./Vector";

// Width of empty area on the left and right side of the track.
const bankWidth = 3;

// Length of empty area before the start and after the end of the
// track.
const bankHeight = 50;

const trackWidth = 40;
const trackCenterX = bankWidth + trackWidth / 2;
const waypointHeight = 2;

export class Level implements Area {
    private camera: Camera = new Camera(this, canvas);

    private track: number[] = [100, 200, 300, 400, 500];
    private trackLength: number = this.track[this.track.length - 1];
    private trackStartY: number = 0 + bankHeight + this.trackLength;
    private trackEndY: number = 0 + bankHeight;

    private characters: Character[] = [];
    private player: Character;

    readonly x = 0;
    readonly y = 0;
    readonly width = trackWidth + 2 * bankWidth;
    readonly height = this.track[this.track.length - 1] + 2 * bankHeight;

    public get progress(): string {
        return this.player.waypoint.toString() + " / " + this.track.length;
    }

    constructor() {
        this.player = new Character({ x: trackCenterX, y: this.trackStartY });
        this.characters.push(this.player);
        this.camera.follow(this.player);
        this.resetZoom();
    }

    resetZoom() {
        this.camera.zoom = 2;
        this.camera.update();
    }

    update(t: number, dt: number): void {
        this.camera.update();

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
        cx.save();

        // Apply camera - drawing in level coordinates after these lines:
        cx.translate(canvas.width / 2, canvas.height / 2);
        cx.scale(this.camera.zoom, this.camera.zoom);
        cx.translate(-this.camera.x, -this.camera.y);

        cx.save();
        cx.strokeStyle = "rgb(70,50,70)";
        cx.lineWidth = trackWidth;
        cx.beginPath();
        cx.moveTo(trackCenterX, this.trackStartY);
        cx.lineTo(trackCenterX, this.trackEndY);
        cx.stroke();

        cx.fillStyle = "rgb(40, 120, 40)";
        cx.fillRect(
            trackCenterX - trackWidth / 2,
            this.trackStartY - waypointHeight,
            trackWidth,
            waypointHeight,
        );

        for (let i = 0; i < this.track.length; i++) {
            const y = this.track[i];
            cx.fillStyle = "rgb(120, 40, 40)";
            cx.fillRect(
                trackCenterX - trackWidth / 2,
                this.trackStartY - y - waypointHeight,
                trackWidth,
                waypointHeight,
            );
        }
        cx.restore();

        for (let i = 0; i < this.characters.length; i++) {
            const c = this.characters[i];
            c.draw(t, dt);
        }

        cx.restore(); // End camera - Drawing no longer in level coordinates
    }

    checkProgress(c: Character): void {
        if (c.waypoint >= this.track.length) {
            return;
        }

        const nextWayPointIndex = c.waypoint;
        const waypointY = this.trackStartY - this.track[nextWayPointIndex];

        if (c.y < waypointY) {
            c.waypoint += 1;
        }
    }
}
