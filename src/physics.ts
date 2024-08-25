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

import { add, isZero, length, multiply, normalize, Vector } from "./Vector";
import { GameObject } from "./GameObject";

const CHARACTER_MAX_SPEED = 0.5;
const CHARACTER_RUN_ACCELERATION = 0.001;
const CHARACTER_STOP_ACCELERATION = 0.001;

export function getMovementVelocity(
    c: GameObject,
    direction: Vector,
    dt: number,
): Vector {
    if (isZero(direction)) {
        // Slow down
        const currentSpeed = length(c.velocity);
        const acc = CHARACTER_STOP_ACCELERATION * dt;
        const slowerSpeed = currentSpeed > acc ? currentSpeed - acc : 0;
        const newVelocity =
            slowerSpeed > 0
                ? multiply(normalize(c.velocity), slowerSpeed)
                : { x: 0, y: 0 };
        return newVelocity;
    }

    const changeOfSpeed = Math.min(
        CHARACTER_RUN_ACCELERATION * dt,
        CHARACTER_MAX_SPEED,
    );
    const movement = multiply(direction, changeOfSpeed);
    let newVelocity = add(c.velocity, movement);

    if (length(newVelocity) > CHARACTER_MAX_SPEED) {
        newVelocity = multiply(normalize(newVelocity), CHARACTER_MAX_SPEED);
    }

    return newVelocity;
}
