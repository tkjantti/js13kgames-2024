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
import { Camera } from "./Camera";
import { Character, CHARACTER_DIMENSIONS, FALL_TIME } from "./Character";
import { GameObject } from "./GameObject";
import { canvas, cx } from "./graphics";
import {
    calculateCollisionBetweenCharacters,
    calculateCollisionToObstacle,
    getMovementVelocity,
} from "./physics";
import { Track } from "./Track";
import { TrackElementType, TT } from "./TrackElement";
import { Vector, ZERO_VECTOR } from "./Vector";
import {
    playTune,
    SFX_BOUNCE,
    // Ignore lint errors from JS import
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
} from "./sfx/sfx.js";

const TRACK_VISIBLE_HEIGHT = 100;

const TRACK_START_Y = 400;

// Width of empty area on the left and right side of the track.
const BANK_WIDTH = 1000;

// Length of empty area before the start and after the end of the
// track.
const BANK_HEIGHT = 40;

export enum State {
    RUNNING,
    GAME_OVER,
    FINISHED,
}

export class Level implements Area {
    private camera: Camera = new Camera(this, canvas);

    private track: Track;

    public characters: Character[] = [];
    private charactersCount = 40;
    private player = new Character(0, ZERO_VECTOR, undefined, 0, 0);

    readonly x;
    readonly y;
    readonly width;
    readonly height;

    state: State = State.RUNNING;

    constructor(
        trackTemplate: readonly TT[],
        playerWidthOffset: number,
        playerHeightOffset: number,
        chars: Character[] | undefined,
    ) {
        this.track = new Track(trackTemplate, TRACK_START_Y);

        this.x = 0 - this.track.width / 2 - BANK_WIDTH;
        this.y = TRACK_START_Y - this.track.height - BANK_HEIGHT;
        this.width = this.track.width + 2 * BANK_WIDTH;
        this.height = this.track.height + 2 * BANK_HEIGHT;

        const startElement = this.track.get(0);
        const startPositionGap =
            startElement.width / (chars ? chars.length : this.charactersCount);
        const startMargin = startPositionGap * 0.3;

        const playerStartPosition = {
            x: startElement.minX + startMargin,
            y: startElement.y + 3,
        };

        this.player = new Character(
            0,
            playerStartPosition,
            this.track,
            playerWidthOffset,
            playerHeightOffset,
        );
        this.characters.push(this.player);

        this.camera.follow(this.player);
        this.camera.visibleAreaHeight = TRACK_VISIBLE_HEIGHT;
        this.camera.update();

        for (
            let i = 1;
            i < (chars ? chars.length : this.charactersCount);
            i++
        ) {
            if (chars && chars[i].eliminated) continue; // Skip already eliminated characters

            const startPosition = {
                x: startElement.minX + startMargin + i * startPositionGap,
                y: startElement.y + 3,
            };
            const aiCharacter = new Character(i, startPosition, this.track);
            this.characters.push(aiCharacter);
        }
    }

    update(t: number, dt: number): void {
        this.camera.update();

        this.track.update(t, dt, this.characters);

        this.calculateMovement(t, dt);

        this.checkCollisions();

        for (let ci = 0; ci < this.characters.length; ci++) {
            const c = this.characters[ci];

            c.move();
        }

        this.checkGameState();
    }

    private calculateMovement(t: number, dt: number): void {
        for (let i = 0; i < this.characters.length; i++) {
            const c = this.characters[i];

            const range = this.track.getBetween(c.y, c.y + c.height);

            let movementDirection: Vector = ZERO_VECTOR;

            if (c.fallStartTime != null) {
                // Can't move when falling.

                if (t - c.fallStartTime > FALL_TIME) {
                    this.dropToLatestCheckpoint(c);
                }
            } else if (
                c.fallStartTime == null &&
                !this.track.isOnPlatform(range, c)
            ) {
                c.fallStartTime = t;
            } else {
                movementDirection = c.getMovement();

                c.setDirection(movementDirection);
                c.velocity = getMovementVelocity(c, movementDirection, dt);
            }
        }
    }

    private checkCollisions(): void {
        // Calculate collisions to other characters.
        for (let ci = 0; ci < this.characters.length; ci++) {
            const c = this.characters[ci];

            // Do not collide if character is finished or eliminated
            if (c.finished || c.eliminated) continue;

            for (let oi = 0; oi < this.characters.length; oi++) {
                if (oi === ci) continue;
                const other = this.characters[oi];
                if (other.finished || other.eliminated) continue;

                if (calculateCollisionBetweenCharacters(c, other)) {
                    const yDistance = Math.abs(c.y - this.player.y);
                    const volumeByDistance =
                        ci === 0 ? 1 : 1 - Math.min(yDistance / 100, 1);
                    if (volumeByDistance > 0)
                        playTune(SFX_BOUNCE, volumeByDistance * 0.5);
                }
            }
        }

        // The obstacles shall have the final word on collision detection.
        for (let ci = 0; ci < this.characters.length; ci++) {
            const c = this.characters[ci];

            const range = this.track.getBetween(c.y, c.y + c.height);
            const { minI, maxI } = range;

            for (let ei = minI; ei <= maxI; ei++) {
                const element = this.track.get(ei);
                for (let oi = 0; oi < element.objects.length; oi++) {
                    const o = element.objects[oi];

                    // Basic distance check if sound should be played
                    if (calculateCollisionToObstacle(c, o)) {
                        const yDistance = Math.abs(o.y - this.player.y);
                        const volumeByDistance =
                            ci === 0 ? 1 : 1 - Math.min(yDistance / 100, 1);
                        if (volumeByDistance > 0)
                            playTune(SFX_BOUNCE, volumeByDistance);
                    }
                }
            }
        }
    }

    private checkGameState(): void {
        for (let ci = 0; ci < this.characters.length; ci++) {
            const c = this.characters[ci];

            const checkpointIndex = this.track.findLatestCheckpoint(c.y);
            if (checkpointIndex > c.latestCheckpointIndex) {
                c.latestCheckpointIndex = checkpointIndex;
                //  13th character will be eliminated if it falls
                if (c.rank === 13) {
                    c.eliminated = true;
                    c.stop();
                    if (!c.ai) this.state = State.GAME_OVER;
                    return;
                }
            }

            // If player character finishes
            // TODO: add time limit or how many can finish if needed
            // TODO: take some steps after finish
            if (c.y + c.height < this.track.finishY) {
                c.finished = true;
                c.stop();
                // If all finished but last 13
                if (c.rank == this.characters.length - 13) {
                    // Set all unfinised characters as eliminated
                    for (let ci = 0; ci < this.characters.length; ci++) {
                        if (
                            this.characters[ci].rank >
                            this.characters.length - 13
                        ) {
                            this.characters[ci].eliminated = true;
                        }
                    }
                    if (this.characters[0].eliminated) {
                        this.state = State.GAME_OVER;
                    } else {
                        this.state = State.FINISHED;
                    }
                }
            }
        }
    }

    private dropToLatestCheckpoint(c: Character): void {
        const checkpoint = this.track.getCheckpoint(c.latestCheckpointIndex);

        //  13th character will be eliminated if it falls
        if (c.rank === 13) {
            c.eliminated = true;
            c.stop();
            if (!c.ai) this.state = State.GAME_OVER;
            return;
        }

        const dropPosition = checkpoint.findEmptySpot(
            CHARACTER_DIMENSIONS,
            this.characters,
        );

        if (dropPosition == null) {
            // No luck, wait for the next frame.
            return;
        }

        c.drop(dropPosition);
    }

    draw(t: number, dt: number): void {
        cx.save();

        // Apply camera - drawing in level coordinates after these lines:
        cx.translate(canvas.width / 2, canvas.height / 2);
        cx.scale(this.camera.zoom, this.camera.zoom);
        cx.translate(-this.camera.x, -this.camera.y);

        const objectsToDraw: GameObject[] = [];

        cx.save();

        const viewArea = this.camera.getViewArea();
        const { minI, maxI } = this.track.getBetween(
            viewArea.y,
            viewArea.y + viewArea.height,
        );

        cx.shadowColor = "rgba(40, 10, 40, 0.6)";

        for (let e = maxI; e >= minI; e--) {
            const element = this.track.get(e);

            const surfaces = element.surfaces;
            cx.fillStyle = element.color;
            cx.shadowColor = element.color
                .replace("rgb", "rgba")
                .replace(")", ",0.6)");
            cx.shadowOffsetY =
                element.height *
                (element.type === TrackElementType.Raft ? 2 : 10);

            if (element.type === TrackElementType.Raft) cx.globalAlpha = 0.5;
            for (let i = 0; i < surfaces.length; i++) {
                const surface = surfaces[i];
                cx.fillRect(
                    surface.x,
                    surface.y,
                    surface.width,
                    surface.height,
                );
            }
            cx.globalAlpha = 1;

            objectsToDraw.push(...element.objects);
        }

        cx.restore();

        objectsToDraw.push(...this.characters);

        // Sort the objects so that objects in front get drawn after
        // objects behind them.
        objectsToDraw.sort((a, b) => a.y + a.height / 2 - (b.y + b.height / 2));

        for (let i = 0; i < objectsToDraw.length; i++) {
            const c = objectsToDraw[i];
            c.draw(t, dt);
        }

        // Gradient shadow overlay
        cx.restore();

        const gradient = cx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, "rgba(0, 0, 0, 1)");
        gradient.addColorStop(0.1, "rgba(0, 0, 0, 0.6)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        cx.fillStyle = gradient;
        cx.fillRect(0, 0, canvas.width, canvas.height);

        // Extract characters from objectsToDraw
        const characters = objectsToDraw.filter(
            (obj) => obj instanceof Character,
        );

        // Separate finished and unfinished characters
        const finishedCharacters = characters.filter((char) => char.finished);
        const unfinishedCharacters = characters.filter(
            (char) => !char.finished,
        );

        // Sort finished characters based on their rank
        finishedCharacters.sort((a, b) => a.rank - b.rank);

        // Sort unfinished characters based on their Y coordinate
        unfinishedCharacters.sort(
            (a, b) => a.y + a.height / 2 - (b.y + b.height / 2),
        );

        // Merge finished and sorted unfinished characters
        const sortedCharacters = [
            ...finishedCharacters,
            ...unfinishedCharacters,
        ];

        // Draw the order number and character name
        cx.save();
        cx.translate(canvas.width / 2, canvas.height / 2);
        cx.scale(this.camera.zoom, this.camera.zoom);
        cx.translate(-this.camera.x, -this.camera.y);

        sortedCharacters.forEach((char, index) => {
            char.rank = index + 1;
            const text = `${char.rank}`;
            cx.fillStyle =
                char.rank === 13
                    ? "red"
                    : char.eliminated
                      ? "crimson"
                      : char.rank > characters.length - 13
                        ? "orange"
                        : char.rank === 1
                          ? "lightgreen"
                          : char.ai
                            ? "white"
                            : "yellow";

            cx.font = !char.ai
                ? "1.4px Sans-serif"
                : char.eliminated || char.rank === 13
                  ? "1.2px Sans-serif"
                  : "1px Sans-serif";
            cx.fillText(
                char.eliminated ? "❌ 13" : text,
                char.x +
                    char.width /
                        (!char.ai
                            ? 8
                            : char.eliminated || char.rank === 13
                              ? 6
                              : 4),
                char.y - char.height * 2.5,
            );
        });

        cx.restore(); // End camera - Drawing no longer in level coordinates
    }
}
