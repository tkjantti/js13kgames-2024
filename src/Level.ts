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
import { createTrack, TrackElement, TT } from "./TrackElement";
import { normalize, Vector } from "./Vector";

const TRACK_START_Y = 400;

// Width of empty area on the left and right side of the track.
const BANK_WIDTH = 10;

// Length of empty area before the start and after the end of the
// track.
const BANK_HEIGHT = 40;

export class Level implements Area {
    private camera: Camera = new Camera(this, canvas);

    private elements: TrackElement[] = [];

    private characters: Character[] = [];
    private player: Character;

    readonly x;
    readonly y;
    readonly width;
    readonly height;

    constructor(trackTemplate: readonly TT[]) {
        this.elements = createTrack(trackTemplate, TRACK_START_Y);

        const trackMinX = Math.min(...this.elements.map((e) => e.minX));
        const trackMaxX = Math.max(...this.elements.map((e) => e.maxX));
        const trackWidth = trackMaxX - trackMinX;
        const trackHeight = this.elements.reduce(
            (total, current) => total + current.height,
            0,
        );

        this.x = 0 - trackWidth / 2 - BANK_WIDTH;
        this.y = TRACK_START_Y - trackHeight - BANK_HEIGHT;
        this.width = trackWidth + 2 * BANK_WIDTH;
        this.height = trackHeight + 2 * BANK_HEIGHT;

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

        for (let e = 0; e < this.elements.length; e++) {
            const element = this.elements[e];

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

            const objects = element.objects;
            for (let i = 0; i < objects.length; i++) {
                const o = objects[i];
                o.draw(t, dt);
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
