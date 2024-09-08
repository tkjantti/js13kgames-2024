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
import { BLOCK_COUNT, BLOCK_WIDTH, BlockType } from "./TrackElement";
import { Vector, ZERO_VECTOR } from "./Vector";

function isWalkableToSomeExtent(t: BlockType): boolean {
    return (
        t === BlockType.Free || t === BlockType.Obstacle || t === BlockType.Raft
    );
}

export class Ai {
    private host: GameObject;
    private track: Track;

    private horizontalMargin: number = 0;

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
            return ZERO_VECTOR;
        }

        const isLeftFromTarget: boolean =
            this.host.x < this.target.x + this.horizontalMargin;
        const isRightFromTarget: boolean =
            this.target.x + this.target.width - this.horizontalMargin <=
            this.host.x + this.host.width;

        const isBehindTarget: boolean =
            this.host.y > this.target.y + this.target.height;
        const isBehindEndOfTarget: boolean =
            this.host.y > this.target.y + this.target.height * 0.1;
        const currentBlockType = this.track.getBlockType(
            currentBlock.row,
            currentBlock.col,
        );

        if (
            isLeftFromTarget &&
            isWalkableToSomeExtent(
                this.track.getBlockType(currentBlock.row, currentBlock.col + 1),
            )
        ) {
            return { x: 1, y: 0 };
        } else if (
            isRightFromTarget &&
            isWalkableToSomeExtent(
                this.track.getBlockType(currentBlock.row, currentBlock.col - 1),
            )
        ) {
            return { x: -1, y: 0 };
        } else if (isBehindTarget) {
            if (
                currentBlockType !== BlockType.Free &&
                !this.track.isFree(currentBlock.row, currentBlock.col)
            ) {
                // Waiting for a raft to reach destination
                return ZERO_VECTOR;
            }
            return { x: 0, y: -1 };
        } else if (isBehindEndOfTarget) {
            if (!this.track.isFree(this.target.row, this.target.col)) {
                // Waiting for a raft to arrive
                return ZERO_VECTOR;
            }

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

            const blockType = this.track.getBlockType(row, col);
            if (blockType === BlockType.Free || blockType === BlockType.Raft) {
                this.horizontalMargin = random(0.2) * BLOCK_WIDTH;
                return this.track.getBlock(row, col);
            }
        }

        return null;
    }
}
