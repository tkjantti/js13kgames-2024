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

import { Area, Dimensions, overlap } from "./Area";
import { Vector } from "./Vector";
import { GameObject } from "./GameObject";
import { Obstacle } from "./Obstacle";
import { randomMinMax } from "./random";

export const ELEMENT_HEIGHT = 16;

const FULL_WIDTH = 80;
const NORMAL_WIDTH = 60;
const NARROW_WIDTH = 40;
const VERY_NARROW_WIDTH = 20;

const LEFTMOST_EDGE = -FULL_WIDTH / 2;
const RIGHTMOST_EDGE = FULL_WIDTH / 2;

export enum TT { // "Track template"
    FullWidth,
    Basic,
    Narrow,
    VeryNarrow,
    DualPassage,
    FullWidthWithObstacleAtCenter,
    FullWidthWithObstacles,
    Finish,
}

export enum TrackElementType {
    Normal,
    Finish,
}

// An element is one horizontal slice of the track. A track is
// composed by laying down several elements one after the other.
export class TrackElement {
    readonly type: TrackElementType;
    readonly surfaces: readonly Area[];
    readonly height: number;
    readonly minX: number;
    readonly maxX: number;
    readonly objects: readonly GameObject[];

    get color(): string {
        switch (this.type) {
            case TrackElementType.Finish:
                return "green";
            default:
                return "rgb(70,50,70)";
        }
    }

    constructor(
        type: TrackElementType,
        surfaces: readonly Area[],
        objects: readonly GameObject[],
    ) {
        this.type = type;
        this.surfaces = surfaces;
        this.objects = objects;
        this.height = ELEMENT_HEIGHT;
        this.minX = Math.min(...this.surfaces.map((s) => s.x));
        this.maxX = Math.max(...this.surfaces.map((s) => s.x + s.width));
    }

    findEmptySpot(c: Dimensions, otherObjects: GameObject[]): Vector {
        // NOTE: This method assumes that this element has only one surface.
        const top = this.surfaces[0].y;

        const margin = c.width * 1;
        const withMargin: Dimensions = {
            width: c.width + 2 * margin,
            height: c.height + 2 * margin,
        };

        for (let iRandom = 0; iRandom < 100; iRandom++) {
            const x = randomMinMax(this.minX, this.maxX - withMargin.width);
            const y = top + randomMinMax(0, ELEMENT_HEIGHT - withMargin.height);
            const temp: Area = {
                x,
                y,
                width: withMargin.width,
                height: withMargin.height,
            };

            for (let i = 0; i < this.objects.length; i++) {
                const o = this.objects[i];

                if (overlap(temp, o)) {
                    continue;
                }
            }

            for (let i = 0; i < otherObjects.length; i++) {
                const o = otherObjects[i];

                if (overlap(temp, o)) {
                    continue;
                }
            }

            return { x: x + margin, y: y + margin };
        }

        return { x: this.minX, y: top };
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
                        x: -FULL_WIDTH / 2,
                        y,
                        width: FULL_WIDTH,
                        height: ELEMENT_HEIGHT,
                    },
                ];
                break;
            case TT.Basic:
                surfaces = [
                    {
                        x: -NORMAL_WIDTH / 2,
                        y,
                        width: NORMAL_WIDTH,
                        height: ELEMENT_HEIGHT,
                    },
                ];
                break;
            case TT.Narrow:
                surfaces = [
                    {
                        x: -NARROW_WIDTH / 2,
                        y,
                        width: NARROW_WIDTH,
                        height: ELEMENT_HEIGHT,
                    },
                ];
                break;
            case TT.VeryNarrow:
                surfaces = [
                    {
                        x: -VERY_NARROW_WIDTH / 2,
                        y,
                        width: VERY_NARROW_WIDTH,
                        height: ELEMENT_HEIGHT,
                    },
                ];
                break;
            case TT.DualPassage:
                surfaces = [
                    {
                        x: LEFTMOST_EDGE + VERY_NARROW_WIDTH / 2,
                        y,
                        width: VERY_NARROW_WIDTH,
                        height: ELEMENT_HEIGHT,
                    },
                    {
                        x:
                            RIGHTMOST_EDGE -
                            VERY_NARROW_WIDTH -
                            VERY_NARROW_WIDTH / 2,
                        y,
                        width: VERY_NARROW_WIDTH,
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
                        x: -Obstacle.WIDTH / 2,
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
                        x: -Obstacle.WIDTH * 2,
                        y: centerY - Obstacle.HEIGHT / 2,
                    }),
                    new Obstacle({
                        x: -Obstacle.WIDTH * 3.5,
                        y: centerY - Obstacle.HEIGHT / 2,
                    }),
                    new Obstacle({
                        x: -Obstacle.WIDTH / 2,
                        y: centerY - Obstacle.HEIGHT / 2,
                    }),
                    new Obstacle({
                        x: Obstacle.WIDTH,
                        y: centerY - Obstacle.HEIGHT / 2,
                    }),
                    new Obstacle({
                        x: Obstacle.WIDTH * 2.5,
                        y: centerY - Obstacle.HEIGHT / 2,
                    }),
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

        return new TrackElement(eType, surfaces, objects);
    });
}
