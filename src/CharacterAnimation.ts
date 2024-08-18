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

export enum CharacterFacingDirection {
    Right,
    Forward,
    Backward,
    ForwardRight,
    BackwardRight,
}

const color = "rgb(200,200,200)";

const faceColor = "rgb(200,150,150)";
const eyeColor = "rgb(230,230,230)";
const pupilColor = "rgb(30,0,0)";
const noseColor = "rgb(170,120,120)";

const LegColor = "rgb(140,140,140)";
const LegColorDarker = "rgb(120,120,120)";
const ArmColor = "rgb(140,140,220)";
const ArmColorDarker = "rgb(120,120,200)";

export function renderCharacter(
    cx: CanvasRenderingContext2D,
    w: number,
    h: number,
    t: number,
    direction: CharacterFacingDirection,
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
    cx.translate(0, -bouncing);

    const armLength = 0.35 * h;
    const legLength = 0.4 * h;
    const torsoLength = 0.4 * h;

    const limbWidth = 0.3 * w;
    const armWidth = 0.2 * w;

    const headHeight = 0.25 * h;
    const headDepth = 0.5 * w;
    const headWidth = 0.45 * w;
    const headRounding = 0.2 * w;

    const faceMargin = 0.15 * w; // How much face is smaller than head
    const faceRounding = 0.6 * headRounding;

    const torsoWidth = 0.6 * w;
    const torsoDepth = 0.4 * w;

    cx.fillStyle = color;
    cx.lineWidth = limbWidth;

    switch (direction) {
        case CharacterFacingDirection.Right:
            {
                // Arm (back)
                cx.save();
                cx.strokeStyle = ArmColorDarker;
                cx.lineWidth = armWidth;
                cx.translate(0.5 * w, 0.4 * h);
                cx.rotate(angle2);
                cx.beginPath();
                cx.moveTo(0, 0);
                cx.lineTo(0, armLength);
                cx.stroke();
                cx.restore();

                // Leg (back)
                cx.save();
                cx.strokeStyle = LegColorDarker;
                cx.translate(0.5 * w, 0.6 * h);
                cx.rotate(angle1);
                cx.beginPath();
                cx.moveTo(0, 0);
                cx.lineTo(0, legLength);
                cx.stroke();
                cx.restore();

                // Leg (front)
                cx.save();
                cx.strokeStyle = LegColor;
                cx.translate(0.5 * w, 0.6 * h);
                cx.rotate(angle2);
                cx.beginPath();
                cx.moveTo(0, 0);
                cx.lineTo(0, legLength);
                cx.stroke();
                cx.restore();

                // Head
                cx.roundRect(
                    0.3 * w,
                    headHeight / 4,
                    headDepth,
                    headHeight,
                    headRounding,
                );
                cx.fill();

                // Torso
                cx.fillRect(
                    (w - torsoDepth) / 2,
                    0.3 * h,
                    torsoDepth,
                    torsoLength,
                );

                // Arm (front)
                cx.save();
                cx.strokeStyle = ArmColor;
                cx.lineWidth = armWidth;
                cx.translate(0.5 * w, 0.4 * h);
                cx.rotate(angle1);
                cx.beginPath();
                cx.moveTo(0, 0);
                cx.lineTo(0, armLength);
                cx.stroke();
                cx.restore();
            }
            break;
        case CharacterFacingDirection.Forward:
        case CharacterFacingDirection.Backward: {
            // Leg (left)
            cx.save();
            cx.strokeStyle = LegColorDarker;
            cx.translate(0.35 * w, 0.6 * h);
            cx.scale(1, Math.cos(angle1 + Math.PI / 8));
            cx.beginPath();
            cx.moveTo(0, 0);
            cx.lineTo(0, legLength);
            cx.stroke();
            cx.restore();

            // Leg (right)
            cx.save();
            cx.strokeStyle = LegColor;
            cx.translate(0.65 * w, 0.6 * h);
            cx.scale(1, Math.cos(angle2 + Math.PI / 8));
            cx.beginPath();
            cx.moveTo(0, 0);
            cx.lineTo(0, legLength);
            cx.stroke();
            cx.restore();

            // Arm (left)
            cx.save();
            cx.strokeStyle = ArmColor;
            cx.lineWidth = armWidth;
            cx.translate(0.1 * w, 0.3 * h);
            cx.scale(1, Math.cos(angle2 + Math.PI / 8));
            cx.beginPath();
            cx.moveTo(0, 0);
            cx.lineTo(0, armLength);
            cx.stroke();
            cx.restore();

            // Arm (right)
            cx.save();
            cx.strokeStyle = ArmColor;
            cx.lineWidth = armWidth;
            cx.translate(0.9 * w, 0.3 * h);
            cx.scale(1, Math.cos(angle1 + Math.PI / 8));
            cx.beginPath();
            cx.moveTo(0, 0);
            cx.lineTo(0, armLength);
            cx.stroke();
            cx.restore();

            // Torso
            cx.fillRect(0.2 * w, 0.3 * h, torsoWidth, torsoLength);

            // Head
            cx.roundRect(
                (w - headWidth) / 2,
                headHeight / 4,
                headWidth,
                headHeight,
                headRounding,
            );
            cx.fill();

            break;
        }
        case CharacterFacingDirection.ForwardRight: {
            // Leg (left)
            cx.save();
            cx.strokeStyle = LegColorDarker;
            cx.translate(0.35 * w, 0.6 * h);
            cx.rotate(angle2 / 4);
            cx.scale(1, Math.cos(angle1 + Math.PI / 8));
            cx.beginPath();
            cx.moveTo(0, 0);
            cx.lineTo(0, legLength);
            cx.stroke();
            cx.restore();

            // Leg (right)
            cx.save();
            cx.strokeStyle = LegColor;
            cx.translate(0.65 * w, 0.6 * h);
            cx.rotate(angle2 / 4);
            cx.scale(1, Math.cos(angle2 + Math.PI / 8));
            cx.beginPath();
            cx.moveTo(0, 0);
            cx.lineTo(0, legLength);
            cx.stroke();
            cx.restore();

            // Arm (left)
            cx.save();
            cx.strokeStyle = ArmColor;
            cx.lineWidth = armWidth;
            cx.translate(0.1 * w, 0.3 * h);
            cx.rotate(angle2 / 2);
            cx.scale(1, Math.cos(angle2 + Math.PI / 8));
            cx.beginPath();
            cx.moveTo(0, 0);
            cx.lineTo(0, armLength);
            cx.stroke();
            cx.restore();

            // Head
            cx.roundRect(
                (w - headWidth) / 2,
                headHeight / 4,
                headWidth,
                headHeight,
                headRounding,
            );
            cx.fill();

            // Torso
            cx.fillRect((w - torsoWidth) / 2, 0.3 * h, torsoWidth, torsoLength);

            // Arm (right)
            cx.save();
            cx.strokeStyle = ArmColor;
            cx.lineWidth = armWidth;
            cx.translate(0.9 * w, 0.3 * h);
            cx.rotate(angle2 / 2);
            cx.scale(1, Math.cos(angle1 + Math.PI / 8));
            cx.beginPath();
            cx.moveTo(0, 0);
            cx.lineTo(0, armLength);
            cx.stroke();
            cx.restore();

            break;
        }
        case CharacterFacingDirection.BackwardRight: {
            // Leg (right)
            cx.save();
            cx.strokeStyle = LegColor;
            cx.translate(0.65 * w, 0.6 * h);
            cx.rotate(angle2 / 4);
            cx.scale(1, Math.cos(angle2 + Math.PI / 8));
            cx.beginPath();
            cx.moveTo(0, 0);
            cx.lineTo(0, legLength);
            cx.stroke();
            cx.restore();

            // Leg (left)
            cx.save();
            cx.strokeStyle = LegColorDarker;
            cx.translate(0.35 * w, 0.6 * h);
            cx.rotate(angle2 / 4);
            cx.scale(1, Math.cos(angle1 + Math.PI / 8));
            cx.beginPath();
            cx.moveTo(0, 0);
            cx.lineTo(0, legLength);
            cx.stroke();
            cx.restore();

            // Arm (right)
            cx.save();
            cx.strokeStyle = ArmColor;
            cx.lineWidth = armWidth;
            cx.translate(0.9 * w, 0.3 * h);
            cx.rotate(angle2 / 2);
            cx.scale(1, Math.cos(angle1 + Math.PI / 8));
            cx.beginPath();
            cx.moveTo(0, 0);
            cx.lineTo(0, armLength);
            cx.stroke();
            cx.restore();

            // Head
            cx.roundRect(
                (w - headWidth) / 2,
                headHeight / 4,
                headWidth,
                headHeight,
                headRounding,
            );
            cx.fill();

            // Torso
            cx.fillRect((w - torsoWidth) / 2, 0.3 * h, torsoWidth, torsoLength);

            // Arm (left)
            cx.save();
            cx.strokeStyle = ArmColor;
            cx.lineWidth = armWidth;
            cx.translate(0.1 * w, 0.3 * h);
            cx.rotate(angle2 / 2);
            cx.scale(1, Math.cos(angle2 + Math.PI / 8));
            cx.beginPath();
            cx.moveTo(0, 0);
            cx.lineTo(0, armLength);
            cx.stroke();
            cx.restore();
            break;
        }
        default:
            break;
    }

    // Face with eyes and nose
    if (
        direction === CharacterFacingDirection.Backward ||
        direction === CharacterFacingDirection.BackwardRight
    ) {
        cx.save();

        // Face
        cx.fillStyle = faceColor;
        const faceWidth = headWidth - faceMargin;
        const faceHeight = headHeight - faceMargin * 1.75;
        const faceX = (w - faceWidth) / 2;
        const faceY = headHeight - faceHeight;

        cx.beginPath();
        cx.roundRect(faceX, faceY, faceWidth, faceHeight, faceRounding);
        cx.fill();
        cx.closePath();

        // Eyes
        const eyeRadius = 0.05 * headWidth;
        const eyeXOffset = faceWidth / 4;
        const eyeYOffset = faceHeight / 3;
        const leftEyeX = faceX + eyeXOffset;
        const rightEyeX = faceX + faceWidth - eyeXOffset;
        const eyeY = faceY + eyeYOffset;

        cx.fillStyle = eyeColor;
        cx.beginPath();
        cx.arc(leftEyeX, eyeY, eyeRadius, 0, Math.PI * 2);
        cx.arc(rightEyeX, eyeY, eyeRadius, 0, Math.PI * 2);
        cx.fill();
        cx.closePath();

        // Pupils
        const pupilRadius = 0.02 * headWidth;
        const pupilXOffset = 0.01 * headWidth;
        const pupilYOffset = 0.01 * headHeight;

        cx.fillStyle = pupilColor;
        cx.beginPath();
        cx.arc(
            leftEyeX + pupilXOffset,
            eyeY + pupilYOffset,
            pupilRadius,
            0,
            Math.PI * 2,
        );
        cx.arc(
            rightEyeX + pupilXOffset,
            eyeY + pupilYOffset,
            pupilRadius,
            0,
            Math.PI * 2,
        );
        cx.fill();
        cx.closePath();

        // Nose
        const noseWidth = 0.1 * headWidth;
        const noseHeight = 0.15 * headHeight;
        const noseX = faceX + (faceWidth - noseWidth) / 1.75;
        const noseY = faceY + (faceHeight - noseHeight) / 1.5;

        cx.fillStyle = noseColor;
        cx.beginPath();
        cx.moveTo(noseX, noseY);
        cx.lineTo(noseX + noseWidth / 2, noseY + noseHeight);
        cx.lineTo(noseX - noseWidth / 2, noseY + noseHeight);
        cx.closePath();
        cx.fill();
        cx.restore();
    }

    cx.restore();
}
