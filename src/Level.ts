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
import { GameObject } from "./GameObject";
import { canvas, cx } from "./graphics";
import { getKeys } from "./keyboard";
import { getMovementVelocity } from "./physics";
import { Track } from "./Track";
import { TT } from "./TrackElement";
import {
    add,
    distance,
    dotProduct,
    multiply,
    normalize,
    subtract,
    Vector,
} from "./Vector";

const TRACK_START_Y = 400;

// Width of empty area on the left and right side of the track.
const BANK_WIDTH = 10;

// Length of empty area before the start and after the end of the
// track.
const BANK_HEIGHT = 40;

const OBSTACLE_BOUNCE_FACTOR = 1.5;

export class Level implements Area {
    private camera: Camera = new Camera(this, canvas);

    private track: Track;

    private characters: Character[] = [];
    private player: Character;

    readonly x;
    readonly y;
    readonly width;
    readonly height;

    constructor(trackTemplate: readonly TT[]) {
        this.track = new Track(trackTemplate, TRACK_START_Y);

        this.x = 0 - this.track.width / 2 - BANK_WIDTH;
        this.y = TRACK_START_Y - this.track.height - BANK_HEIGHT;
        this.width = this.track.width + 2 * BANK_WIDTH;
        this.height = this.track.height + 2 * BANK_HEIGHT;

        this.player = new Character({ x: 0, y: TRACK_START_Y - 10 });
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

            const movementDirection =
                c === this.player ? this.getPlayerMovement() : { x: 0, y: 0 };

            c.velocity = getMovementVelocity(c, movementDirection, dt);

            c.move(movementDirection);

            const { minI, maxI } = this.track.getBetween(c.y, c.y + c.height);

            for (let ei = minI; ei <= maxI; ei++) {
                const element = this.track.get(ei);
                for (let oi = 0; oi < element.objects.length; oi++) {
                    const o = element.objects[oi];

                    const radiusC = c.width / 2;
                    const radiusO = o.width / 2;

                    const centerC: Vector = {
                        x: c.x + c.width / 2,
                        y: c.y + c.height / 2,
                    };
                    const centerO: Vector = {
                        x: o.x + o.width / 2,
                        y: o.y + o.height / 2,
                    };

                    if (distance(centerC, centerO) < radiusC + radiusO) {
                        const directionToOther = normalize(
                            subtract(centerO, centerC),
                        );
                        const speedToOther = dotProduct(
                            c.velocity,
                            directionToOther,
                        );
                        const bouncingVelocity = multiply(
                            directionToOther,
                            -speedToOther * OBSTACLE_BOUNCE_FACTOR,
                        );
                        const updatedVelocity = add(
                            c.velocity,
                            bouncingVelocity,
                        );

                        c.velocity = updatedVelocity;
                        c.move(movementDirection);
                    }
                }
            }

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

        const objectsToDraw: GameObject[] = [];

        cx.save();

        const viewArea = this.camera.getViewArea();
        const { minI, maxI } = this.track.getBetween(
            viewArea.y,
            viewArea.y + viewArea.height,
        );

        for (let e = maxI; e >= minI; e--) {
            const element = this.track.get(e);

            const surfaces = element.surfaces;
            cx.fillStyle = "rgb(70,50,70)";

            for (let i = 0; i < surfaces.length; i++) {
                const surface = surfaces[i];
                cx.fillRect(
                    surface.x,
                    surface.y,
                    surface.width,
                    surface.height,
                );
            }

            objectsToDraw.push(...element.objects);
        }

        cx.restore();

        objectsToDraw.push(...this.characters);

        // Sort the objects so that objects in front get drawn after
        // objects behind them.
        objectsToDraw.sort((a, b) => a.y + a.height / 2 - (b.y + b.height / 2));

        for (let i = 0; i < objectsToDraw.length; i++) {
            const c = objectsToDraw[i];
            c.draw(t, dt);
        }

        cx.restore(); // End camera - Drawing no longer in level coordinates
    }
}
