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

import { easeInOutQuad, easeInOutSine } from "./easings";
import { triangle } from "./sequences";

export enum CharacterAnimation {
    Still,
    Walk,
    Run,
}

const color = "rgb(200,200,200)";
const LegColor = "rgb(140,140,140)";
const LegColorDarker = "rgb(120,120,120)";
const ArmColor = "rgb(140,140,220)";
const ArmColorDarker = "rgb(120,120,200)";

export function renderCharacter(
    cx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    t: number,
    animation: CharacterAnimation,
): void {
    let period = 0;
    let angle1 = 0;
    let angle2 = 0;
    let bouncing = 0;

    switch (animation) {
        case CharacterAnimation.Walk:
            period = 800;
            bouncing = easeInOutSine(triangle(period / 2, t)) * 0.02 * h;
            angle1 =
                -Math.PI / 8 +
                easeInOutQuad(triangle(period, t)) * (Math.PI / 4);

            angle2 =
                -Math.PI / 8 +
                easeInOutQuad(triangle(period, t + period / 2)) * (Math.PI / 4);
            break;
        case CharacterAnimation.Run:
            period = 1600;
            bouncing =
                easeInOutSine(triangle(period / 2, t) + period / 2) * 0.1 * h;
            angle1 =
                (-Math.PI * 3) / 8 +
                easeInOutQuad(triangle(period, t)) * 3 * (Math.PI / 4);

            angle2 =
                (-Math.PI * 3) / 8 +
                easeInOutQuad(triangle(period, t + period / 2)) *
                    3 *
                    (Math.PI / 4);
            break;
    }

    cx.save();
    cx.translate(x, y);
    cx.translate(0, -bouncing);

    cx.fillStyle = color;
    cx.lineWidth = w * 0.4;

    // Debug border
    // cx.save();
    // cx.strokeStyle = "red";
    // cx.lineWidth = 1;
    // cx.strokeRect(0, 0, w, h);
    // cx.restore();

    // Arm (back)
    cx.save();
    cx.strokeStyle = ArmColorDarker;
    cx.translate(0.5 * w, 0.4 * h);
    cx.rotate(angle2);
    cx.beginPath();
    cx.moveTo(0, 0);
    cx.lineTo(0, 0.35 * h);
    cx.stroke();
    cx.restore();

    // Leg (back)
    cx.save();
    cx.strokeStyle = LegColorDarker;
    cx.translate(0.5 * w, 0.6 * h);
    cx.rotate(angle1);
    cx.beginPath();
    cx.moveTo(0, 0);
    cx.lineTo(0, 0.4 * h);
    cx.stroke();
    cx.restore();

    // Leg (front)
    cx.save();
    cx.strokeStyle = LegColor;
    cx.translate(0.5 * w, 0.6 * h);
    cx.rotate(angle2);
    cx.beginPath();
    cx.moveTo(0, 0);
    cx.lineTo(0, 0.4 * h);
    cx.stroke();
    cx.restore();

    // Head
    const headRadius = w * 0.35;
    cx.beginPath();
    cx.arc(0.5 * w, 0.15 * h, headRadius, 0, 2 * Math.PI);
    cx.fill();

    // Torso
    cx.fillRect(0 * w, 0.3 * h, 1 * w, 0.4 * h);

    // Arm (front)
    cx.save();
    cx.strokeStyle = ArmColor;
    cx.translate(0.5 * w, 0.4 * h);
    cx.rotate(angle1);
    cx.beginPath();
    cx.moveTo(0, 0);
    cx.lineTo(0, 0.35 * h);
    cx.stroke();
    cx.restore();

    cx.restore();
}
