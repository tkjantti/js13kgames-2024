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

const TRACK_START_Y = 400;
const ELEMENT_HEIGHT = 20;

// Width of empty area on the left and right side of the track.
const BANK_WIDTH = 10;

// Length of empty area before the start and after the end of the
// track.
const BANK_HEIGHT = 40;

class Element {
    readonly surfaces: readonly Area[];
    readonly minX: number;
    readonly maxX: number;

    constructor(surfaces: readonly Area[]) {
        this.surfaces = surfaces;
        this.minX = Math.min(...this.surfaces.map((s) => s.x));
        this.maxX = Math.max(...this.surfaces.map((s) => s.x + s.width));
    }
}

export class Level implements Area {
    private camera: Camera = new Camera(this, canvas);

    private elements: Element[] = [];

    private characters: Character[] = [];
    private player: Character;

    readonly x;
    readonly y;
    readonly width;
    readonly height;

    constructor() {
        this.elements = [
            new Element([
                {
                    x: -40,
                    y: TRACK_START_Y - ELEMENT_HEIGHT,
                    width: 80,
                    height: ELEMENT_HEIGHT,
                },
            ]),
            new Element([
                {
                    x: -20,
                    y: TRACK_START_Y - ELEMENT_HEIGHT * 2,
                    width: 40,
                    height: ELEMENT_HEIGHT,
                },
            ]),
            new Element([
                {
                    x: -40,
                    y: TRACK_START_Y - ELEMENT_HEIGHT * 3,
                    width: 80,
                    height: ELEMENT_HEIGHT,
                },
            ]),
            new Element([
                {
                    x: -40,
                    y: TRACK_START_Y - ELEMENT_HEIGHT * 4,
                    width: 30,
                    height: ELEMENT_HEIGHT,
                },
                {
                    x: 10,
                    y: TRACK_START_Y - ELEMENT_HEIGHT * 4,
                    width: 30,
                    height: ELEMENT_HEIGHT,
                },
            ]),
            new Element([
                {
                    x: -40,
                    y: TRACK_START_Y - ELEMENT_HEIGHT * 5,
                    width: 80,
                    height: ELEMENT_HEIGHT,
                },
            ]),
            new Element([
                {
                    x: -40,
                    y: TRACK_START_Y - ELEMENT_HEIGHT * 6,
                    width: 80,
                    height: ELEMENT_HEIGHT,
                },
            ]),
        ];

        const trackMinX = Math.min(...this.elements.map((e) => e.minX));
        const trackMaxX = Math.max(...this.elements.map((e) => e.maxX));
        const trackWidth = trackMaxX - trackMinX;
        const trackHeight = this.elements.length * ELEMENT_HEIGHT;

        this.x = 0 - trackWidth / 2 - BANK_WIDTH;
        this.y = TRACK_START_Y - trackHeight - BANK_HEIGHT;
        this.width = trackWidth + 2 * BANK_WIDTH;
        this.height = trackHeight + 2 * BANK_HEIGHT;

        this.player = new Character({ x: 0, y: TRACK_START_Y });
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

        cx.strokeStyle = "red";
        cx.lineWidth = 1;
        cx.strokeRect(this.x, this.y, this.width, this.height);

        for (let i = 0; i < this.elements.length; i++) {
            const surfaces = this.elements[i].surfaces;
            cx.fillStyle = "rgb(70,50,70)";

            for (let j = 0; j < surfaces.length; j++) {
                const surface = surfaces[j];
                cx.fillRect(
                    surface.x,
                    surface.y,
                    surface.width,
                    surface.height,
                );
            }
        }

        cx.restore();

        for (let i = 0; i < this.characters.length; i++) {
            const c = this.characters[i];
            c.draw(t, dt);
        }

        cx.restore(); // End camera - Drawing no longer in level coordinates
    }
}
