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

const ELEMENT_HEIGHT = 20;

const FULL_WIDTH = 80;
const NORMAL_WIDTH = 60;
const NARROW_WIDTH = 40;
const VERY_NARROW_WIDTH = 20;

const LEFTMOST_EDGE = -FULL_WIDTH / 2;
const RIGHTMOST_EDGE = FULL_WIDTH / 2;

export enum TrackElementTemplate {
    Full,
    Normal,
    Narrow,
    VeryNarrow,
    Dual,
}

export class TrackElement {
    readonly surfaces: readonly Area[];
    readonly height: number;
    readonly minX: number;
    readonly maxX: number;

    constructor(surfaces: readonly Area[]) {
        this.surfaces = surfaces;
        this.height = ELEMENT_HEIGHT;
        this.minX = Math.min(...this.surfaces.map((s) => s.x));
        this.maxX = Math.max(...this.surfaces.map((s) => s.x + s.width));
    }
}

export function createTrack(
    templates: readonly TrackElementTemplate[],
    startY: number,
): TrackElement[] {
    return templates.map((t, i) => {
        const y = startY - ELEMENT_HEIGHT * (i + 1);
        let surfaces: Area[] = [];

        switch (t) {
            case TrackElementTemplate.Full:
                surfaces = [
                    {
                        x: -FULL_WIDTH / 2,
                        y,
                        width: FULL_WIDTH,
                        height: ELEMENT_HEIGHT,
                    },
                ];
                break;
            case TrackElementTemplate.Normal:
                surfaces = [
                    {
                        x: -NORMAL_WIDTH / 2,
                        y,
                        width: NORMAL_WIDTH,
                        height: ELEMENT_HEIGHT,
                    },
                ];
                break;
            case TrackElementTemplate.Narrow:
                surfaces = [
                    {
                        x: -NARROW_WIDTH / 2,
                        y,
                        width: NARROW_WIDTH,
                        height: ELEMENT_HEIGHT,
                    },
                ];
                break;
            case TrackElementTemplate.VeryNarrow:
                surfaces = [
                    {
                        x: -VERY_NARROW_WIDTH / 2,
                        y,
                        width: VERY_NARROW_WIDTH,
                        height: ELEMENT_HEIGHT,
                    },
                ];
                break;
            case TrackElementTemplate.Dual:
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
            default:
                break;
        }

        return new TrackElement(surfaces);
    });
}
