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

import {
    CharacterAnimation,
    CharacterFacingDirection,
    renderCharacter,
} from "./CharacterAnimation";
import { cx } from "./graphics";
import { mirrorHorizontally } from "./rendering";
import { isZero, Vector } from "./Vector";

const PLAYER_SPEED = 3;

export class Character {
    private direction: Vector = { x: 0, y: 0 };

    x: number;
    y: number;
    width = 75;
    height = 150;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    move(direction: Vector): void {
        this.direction = direction;
        this.x += direction.x * PLAYER_SPEED;
        this.y += direction.y * PLAYER_SPEED;
    }

    // eslint-disable-next-line
    update(t: number, dt: number): void {}

    // eslint-disable-next-line
    draw(t: number, _: number): void {
        const animation: CharacterAnimation = isZero(this.direction)
            ? CharacterAnimation.Still
            : CharacterAnimation.Walk;

        const direction: CharacterFacingDirection =
            this.direction.y !== 0
                ? this.direction.x === 0
                    ? CharacterFacingDirection.Forward
                    : CharacterFacingDirection.ForwardRight
                : CharacterFacingDirection.Right;

        cx.save();
        cx.translate(this.x, this.y);

        if (this.direction.x < 0) {
            mirrorHorizontally(cx, this.width);
        }

        renderCharacter(cx, this.width, this.height, t, direction, animation);
        cx.restore();
    }
}
