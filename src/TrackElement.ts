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

import { Area, Dimensions, includes, overlap } from "./Area";
import { Vector } from "./Vector";
import { GameObject } from "./GameObject";
import { Obstacle } from "./Obstacle";
import { randomMinMax } from "./random";

export const BLOCK_WIDTH = 10;
export const BLOCK_COUNT = 9;

export const ELEMENT_HEIGHT = 16;

const FULL_WIDTH = BLOCK_WIDTH * BLOCK_COUNT;
const NORMAL_WIDTH = BLOCK_WIDTH * 7;
const NARROW_WIDTH = BLOCK_WIDTH * 5;
const VERY_NARROW_WIDTH = BLOCK_WIDTH * 3;

export const LEFTMOST_EDGE = -FULL_WIDTH / 2;
export const RIGHTMOST_EDGE = FULL_WIDTH / 2;

export enum TT { // "Track template"
    FullWidth,
    Basic,
    Narrow,
    VeryNarrow,
    DualPassage,
    FullWidthWithObstacleAtCenter,
    FullWidthWithObstacles,
    Chasm,
    Raft,
    Checkpoint,
    Finish,
}

export enum TrackElementType {
    Normal,
    CheckPoint,
    Finish,
}

export interface Raft extends Area {
    yDirection: number;
    dockStartTime: number;
}

export function isRaft(surface: Area): surface is Raft {
    return "yDirection" in surface;
}

// An element is one horizontal slice of the track. A track is
// composed by laying down several elements one after the other.
export class TrackElement {
    readonly y: number;
    readonly type: TrackElementType;
    readonly surfaces: readonly Area[];
    readonly width: number;
    readonly height: number;
    readonly minX: number;
    readonly maxX: number;
    readonly blocks: boolean[] = new Array(BLOCK_COUNT);
    readonly objects: readonly GameObject[];

    get color(): string {
        switch (this.type) {
            case TrackElementType.CheckPoint:
                return "rgb(20, 50, 20)";
            case TrackElementType.Finish:
                return "rgb(0, 255, 0)";
            default:
                return "rgb(40,10,40)";
        }
    }

    constructor(
        y: number,
        type: TrackElementType,
        surfaces: readonly Area[],
        objects: readonly GameObject[],
    ) {
        this.y = y;
        this.type = type;
        this.surfaces = surfaces;
        this.objects = objects;
        this.minX = Math.min(...this.surfaces.map((s) => s.x));
        this.maxX = Math.max(...this.surfaces.map((s) => s.x + s.width));
        this.width = this.maxX - this.minX;
        this.height = ELEMENT_HEIGHT;
        this.calculateBlocks();
    }

    calculateBlocks(): void {
        const margin = BLOCK_WIDTH * 0.1;

        for (let i = 0; i < BLOCK_COUNT; i++) {
            const x = LEFTMOST_EDGE + i * BLOCK_WIDTH;
            const block: Area = {
                x: x + margin,
                y: this.y + margin,
                width: BLOCK_WIDTH - 2 * margin,
                height: ELEMENT_HEIGHT - 2 * margin,
            };

            const isVacant: boolean =
                this.surfaces.some((s) => includes(s, block)) &&
                !this.objects.some((o) => overlap(o, block));

            this.blocks[i] = isVacant;
        }
    }

    isFree(y: number, col: number): boolean {
        const margin = BLOCK_WIDTH * 0.1;

        const x = LEFTMOST_EDGE + col * BLOCK_WIDTH;
        const block: Area = {
            x: x + margin,
            y: y + margin,
            width: BLOCK_WIDTH - 2 * margin,
            height: ELEMENT_HEIGHT - 2 * margin,
        };

        return (
            this.surfaces.some((s) => includes(s, block)) &&
            !this.objects.some((o) => overlap(o, block))
        );
    }

    findEmptySpot(c: Dimensions, otherObjects: GameObject[]): Vector | null {
        const margin = c.width * 0.5;
        const withMargin: Dimensions = {
            width: c.width + 2 * margin,
            height: c.height + 2 * margin,
        };

        for (let iRandom = 0; iRandom < 50; iRandom++) {
            const x = randomMinMax(this.minX, this.maxX - withMargin.width);
            const y =
                this.y + randomMinMax(0, ELEMENT_HEIGHT - withMargin.height);

            const spotWithMargin: Area = {
                x,
                y,
                width: withMargin.width,
                height: withMargin.height,
            };

            if (!this.surfaces.some((s) => overlap(s, spotWithMargin))) {
                continue;
            }

            if (this.objects.some((o) => overlap(o, spotWithMargin))) {
                continue;
            }

            if (otherObjects.some((o) => overlap(o, spotWithMargin))) {
                continue;
            }

            return { x: x + margin, y: y + margin };
        }

        return null;
    }
}

export function createTrack(
    templates: readonly TT[],
    startY: number,
): TrackElement[] {
    return templates.map((t, i) => {
        const y = startY - ELEMENT_HEIGHT * (i + 1);
        const centerY = y + ELEMENT_HEIGHT / 2;

        let eType = TrackElementType.Normal;
        let surfaces: Area[] = [];
        let objects: GameObject[] = [];

        switch (t) {
            case TT.FullWidth:
                surfaces = [
                    {
                        x: LEFTMOST_EDGE,
                        y,
                        width: FULL_WIDTH,
                        height: ELEMENT_HEIGHT,
                    },
                ];
                break;
            case TT.Basic:
                surfaces = [
                    {
                        x: LEFTMOST_EDGE + BLOCK_WIDTH * 1,
                        y,
                        width: NORMAL_WIDTH,
                        height: ELEMENT_HEIGHT,
                    },
                ];
                break;
            case TT.Narrow:
                surfaces = [
                    {
                        x: LEFTMOST_EDGE + BLOCK_WIDTH * 2,
                        y,
                        width: NARROW_WIDTH,
                        height: ELEMENT_HEIGHT,
                    },
                ];
                break;
            case TT.VeryNarrow:
                surfaces = [
                    {
                        x: LEFTMOST_EDGE + BLOCK_WIDTH * 3,
                        y,
                        width: VERY_NARROW_WIDTH,
                        height: ELEMENT_HEIGHT,
                    },
                ];
                break;
            case TT.DualPassage:
                surfaces = [
                    {
                        x: LEFTMOST_EDGE + BLOCK_WIDTH,
                        y,
                        width: BLOCK_WIDTH * 2,
                        height: ELEMENT_HEIGHT,
                    },
                    {
                        x: RIGHTMOST_EDGE - BLOCK_WIDTH * 3,
                        y,
                        width: BLOCK_WIDTH * 2,
                        height: ELEMENT_HEIGHT,
                    },
                ];
                break;
            case TT.FullWidthWithObstacleAtCenter:
                surfaces = [
                    {
                        x: -FULL_WIDTH / 2,
                        y,
                        width: FULL_WIDTH,
                        height: ELEMENT_HEIGHT,
                    },
                ];
                objects = [
                    new Obstacle({
                        x: LEFTMOST_EDGE + BLOCK_WIDTH * 4,
                        y: centerY - Obstacle.HEIGHT / 2,
                    }),
                ];
                break;
            case TT.FullWidthWithObstacles:
                surfaces = [
                    {
                        x: -FULL_WIDTH / 2,
                        y,
                        width: FULL_WIDTH,
                        height: ELEMENT_HEIGHT,
                    },
                ];
                objects = [
                    new Obstacle({
                        x: LEFTMOST_EDGE + BLOCK_WIDTH,
                        y: centerY - Obstacle.HEIGHT / 2,
                    }),
                    new Obstacle({
                        x: LEFTMOST_EDGE + BLOCK_WIDTH * 3,
                        y: centerY - Obstacle.HEIGHT / 2,
                    }),
                    new Obstacle({
                        x: LEFTMOST_EDGE + BLOCK_WIDTH * 5,
                        y: centerY - Obstacle.HEIGHT / 2,
                    }),
                    new Obstacle({
                        x: LEFTMOST_EDGE + BLOCK_WIDTH * 7,
                        y: centerY - Obstacle.HEIGHT / 2,
                    }),
                ];
                break;
            case TT.Chasm:
                // Nothing here!
                break;
            case TT.Raft:
                const raft: Raft = {
                    yDirection: -1,
                    dockStartTime: 0,
                    x: LEFTMOST_EDGE + BLOCK_WIDTH * 3,
                    y,
                    width: VERY_NARROW_WIDTH,
                    height: ELEMENT_HEIGHT,
                };
                surfaces = [raft];
                break;
            case TT.Checkpoint:
                eType = TrackElementType.CheckPoint;
                surfaces = [
                    {
                        x: -FULL_WIDTH / 2,
                        y,
                        width: FULL_WIDTH,
                        height: ELEMENT_HEIGHT,
                    },
                ];
                break;
            case TT.Finish:
                eType = TrackElementType.Finish;
                surfaces = [
                    {
                        x: -FULL_WIDTH / 2,
                        y,
                        width: FULL_WIDTH,
                        height: ELEMENT_HEIGHT,
                    },
                ];
                break;

            default:
                break;
        }

        return new TrackElement(y, eType, surfaces, objects);
    });
}
