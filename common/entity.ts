/**
 *  Game3D, a 3D Platformer built for the web.
 *  Copyright (C) 2021-2024 Codetoil
 *  
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *  
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *  
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import * as BABYLON from "@babylonjs/core";
import type { InputController } from "./inputController";
import type { Wall, World } from "./world";

export abstract class Entity {
    public mesh!: BABYLON.Mesh;
    public inputController!: InputController;
    public world!: World;
    public height!: number;

    public pos!: BABYLON.Vector3;
    public velH: BABYLON.Vector3 = new BABYLON.Vector3(0.0, 0.0, 0.0);
    public vely: number = 0.0;
    public rot!: BABYLON.Quaternion;
    public facingDirection: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 1).normalize();

    public onGround: boolean = false;
    public onWall: boolean = false;

    public abstract gravity: number;

    public setHeight(height: number): Entity {
        this.height = height;
        return this;
    }

    public setMesh(mesh: BABYLON.Mesh): Entity {
        this.mesh = mesh;
        return this;
    }

    public setPositionAndRotation(
        pos: BABYLON.Vector3,
        rot: BABYLON.Quaternion
    ): Entity {
        this.pos = this.mesh.position = pos;
        this.rot = this.mesh.rotationQuaternion = rot;
        return this;
    }

    protected abstract checkCollisions(): void;

    public setWorld(world: World): Entity {
        this.world = world;
        return this;
    }
}

export abstract class Player extends Entity {
    public maxHSpeed: number = -1.0;
    public canWallJump: boolean = true;
    public lastWallWallJumpedFrom: BABYLON.Nullable<Wall> = null;
    public jumpState: boolean = false;

    public get gravity(): number {
        if (this.onWall) return -83.333;
        if (this.inputController.jumpPressed) return -90.0;
        return -100.0;
    }

    protected get hMovementScaleFactor() {
        return this.onGround ? 5.0 : 1.0;
    }
}