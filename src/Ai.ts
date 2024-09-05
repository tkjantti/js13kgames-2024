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
import { random } from "./random";
import { Block, Track } from "./Track";
import { BLOCK_COUNT } from "./TrackElement";
import { Vector, ZERO_VECTOR } from "./Vector";

export class Ai {
    private host: GameObject;
    private track: Track;

    target: Block | null = null;

    constructor(host: GameObject, track: Track) {
        this.host = host;
        this.track = track;
    }

    reset(): void {
        this.target = null;
    }

    getMovement(): Vector {
        const pos: Vector = getCenter(this.host);
        const currentBlock = this.track.getBlockAt(pos);

        if (this.target == null) {
            const nextTarget = this.findNextTarget(currentBlock);

            if (nextTarget == null) {
                return ZERO_VECTOR;
            }

            this.target = nextTarget;
        }

        if (this.host.x < this.target.x) {
            return { x: 1, y: 0 };
        } else if (
            this.target.x + this.target.width <=
            this.host.x + this.host.width
        ) {
            return { x: -1, y: 0 };
        } else if (this.host.y > this.target.y) {
            return { x: 0, y: -1 };
        } else {
            this.target = null;
            return ZERO_VECTOR;
        }
    }

    private findNextTarget(currentBlock: Block): Block | null {
        for (let i = 0; i < BLOCK_COUNT - 1; i++) {
            const diff = (random() < 0.5 ? -1 : 1) * i;
            const row = currentBlock.row + 1;
            const col = currentBlock.col + diff;

            if (this.track.isFree(row, col)) {
                return this.track.getBlock(row, col);
            }
        }

        return null;
    }
}
