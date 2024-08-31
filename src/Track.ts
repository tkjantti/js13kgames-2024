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

import { Area, overlap } from "./Area";
import { createTrack, ELEMENT_HEIGHT, TrackElement, TT } from "./TrackElement";

export interface IndexRange {
    minI: number;
    maxI: number;
}

export class Track {
    private elements: TrackElement[] = [];
    private startY: number;

    finishY: number;

    width: number;
    height: number;

    constructor(templates: readonly TT[], startY: number) {
        this.elements = createTrack(templates, startY);
        this.startY = startY;
        this.finishY =
            this.startY - (this.elements.length - 1) * ELEMENT_HEIGHT;

        const minX = Math.min(...this.elements.map((e) => e.minX));
        const maxX = Math.max(...this.elements.map((e) => e.maxX));

        this.width = maxX - minX;
        this.height = this.elements.length * ELEMENT_HEIGHT;
    }

    get(i: number): TrackElement {
        return this.elements[i];
    }

    getBetween(topY: number, bottomY: number): IndexRange {
        const countOfElementsToTopY = Math.ceil(
            Math.max(this.startY - topY, 0) / ELEMENT_HEIGHT,
        );
        const countOfElementsToBottomY = Math.floor(
            Math.max(this.startY - bottomY, 0) / ELEMENT_HEIGHT,
        );

        return {
            minI: Math.max(countOfElementsToBottomY - 1, 0),
            maxI: Math.min(countOfElementsToTopY, this.elements.length) - 1,
        };
    }

    isOnPlatform(range: IndexRange, area: Area): boolean {
        const { minI, maxI } = range;

        for (let e = maxI; e >= minI; e--) {
            const element = this.get(e);
            const surfaces = element.surfaces;

            for (let i = 0; i < surfaces.length; i++) {
                const surface = surfaces[i];

                if (overlap(area, surface)) {
                    return true;
                }
            }
        }

        return false;
    }
}
