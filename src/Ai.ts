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

import { getCenter } from "./Area";
import { GameObject } from "./GameObject";
import { Track } from "./Track";
import { YPosition } from "./TrackElement";
import { normalize, subtract, Vector, ZERO_VECTOR } from "./Vector";

const NARROWEST_SCAN_MARGIN = 5;
const NARROW_SCAN_MARGIN = 15;

export class Ai {
    private host: GameObject;
    private lastMovement: Vector = ZERO_VECTOR;
    target: Vector | null = null;

    constructor(host: GameObject) {
        this.host = host;
    }

    reset(): void {
        this.target = null;
        this.lastMovement = ZERO_VECTOR;
    }

    getMovement(track: Track): Vector {
        const pos: Vector = getCenter(this.host);

        if (
            this.target != null &&
            this.host.y > this.target.y + this.host.height * 3
        ) {
            return this.lastMovement;
        }

        const nextElement = track.getNextElement(this.host);

        if (nextElement == null) {
            return ZERO_VECTOR;
        }

        let targetSpot = nextElement.findEmptySpot(
            this.host,
            [],
            YPosition.CenterVertically,
            pos.x - NARROWEST_SCAN_MARGIN,
            pos.y + NARROWEST_SCAN_MARGIN,
        );

        // No free spot found from narrow region, look wider.
        if (targetSpot == null) {
            targetSpot = nextElement.findEmptySpot(
                this.host,
                [],
                YPosition.CenterVertically,
                pos.x - NARROW_SCAN_MARGIN,
                pos.y + NARROW_SCAN_MARGIN,
            );
        }

        // Still no free spot found, look even wider.
        if (targetSpot == null) {
            targetSpot = nextElement.findEmptySpot(
                this.host,
                [],
                YPosition.CenterVertically,
            );
        }

        if (targetSpot == null) {
            // No free spot found at all, paralyze :(
            return (this.lastMovement = ZERO_VECTOR);
        }

        const target: Vector = {
            x: targetSpot.x + this.host.width / 2,
            y: targetSpot.y + this.host.height / 2,
        };

        const direction = normalize(subtract(target, pos));

        this.target = target;
        this.lastMovement = direction;
        return direction;
    }
}
