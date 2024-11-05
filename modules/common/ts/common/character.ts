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
import type {CharacterInputController} from "./characterInputController";
import {World} from "./world";
import {AbstractMesh} from "@babylonjs/core";
import {NamespacedKey} from "./namespacedKey";

/**
 * A character in the game world. Can be an Ally, an Enemy, or both. Can be a Player or an NPC.
 */
export class Character {
    protected _mesh!: BABYLON.Mesh;
    protected _characterWorld!: World;
    protected _characterInputController!: CharacterInputController;

    // Character Location and Rotation
    protected _characterPosition!: BABYLON.Vector3;
    protected _characterVelocity: BABYLON.Vector3 = new BABYLON.Vector3(0.0, 0.0, 0.0);
    protected _characterOrientation!: BABYLON.Quaternion;
    protected _characterRayOfView: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 1).normalize();

    // Character Properties
    // TODO: Load in at runtime
    protected _characterHeight: number = 2.0;
    protected _characterMaximumHealthPoints: number = 10;
    protected _characterMaximumManaPoints: number = 10;
    protected _characterMaximumSkillPoints: number = 10;
    protected _characterMaximumHorizontalSpeedUponJoystickNeutral: number = 2.5;
    protected _characterMaximumHorizontalSpeedUponJoystickFullyActive: number = 12.5;
    protected _characterMaximumVerticalSpeed: number = 50.0;
    protected _characterVerticalJumpVelocity: number = 28.0;
    protected _characterGroundFriction: number = 0.7;
    protected _characterWallSlideGravitationalAcceleration: number = -83.333;
    protected _characterGravitionalAccelerationUponHoldingJump: number = -90.0;
    protected _characterNormalGravititationalAcceleration: number = -100.0;

    // Character State
    protected _healthPoints!: number;
    protected _manaPoints!: number;

    protected _canWallJumpNow: boolean = true;
    protected _lastWallWallJumpedFrom: BABYLON.Nullable<BABYLON.AbstractMesh> = null;
    protected _jumpState: boolean = false;
    /**
     * A map from a world surface type to a boolean
     */
    public readonly isCharacterOnWorldSurface: Map<NamespacedKey, boolean> = new Map([
        [new NamespacedKey("game3d", "ground"),  false],
        [new NamespacedKey("game3d", "wall"), false]
    ]);

    /**
     * An array of skills this character is using right now.
     */
    public readonly characterSkillsEquiped: Array<NamespacedKey> = new Array(

    );

    /**
     * A map from an inventory slot to the item.
     */
    public readonly characterInventory: Map<NamespacedKey, NamespacedKey> = new Map(

    );

    public get mesh(): BABYLON.Mesh
    {
        return this._mesh;
    }
    public get characterWorld(): World
    {
        return this._characterWorld;
    }
    public get characterInputController(): CharacterInputController
    {
        return this._characterInputController;
    }


    // Character Location and Rotation
    /**
     * Character position in 3D Space.
     */
    public get characterPosition(): BABYLON.Vector3
    {
        return this._characterPosition;
    }

    /**
     * Character Velocity in 3D Space.
     */
    public get characterVelocity(): BABYLON.Vector3
    {
        return this._characterVelocity;
    }

    /**
     * Character Orientation in 3D Space (as a Quaternion)
     */
    public get characterOrientation(): BABYLON.Quaternion
    {
        return this._characterOrientation;
    }

    /**
     * Character Ray of View in 3D Space
     */
    public get characterRayOfView(): BABYLON.Vector3
    {
        return this._characterRayOfView;
    }

    // Character Properties
    public get characterHeight(): number
    {
        return this._characterHeight;
    }
    public get characterMaximumHealthPoints(): number
    {
        return this._characterMaximumHealthPoints;
    }
    public get characterMaximumManaPoints(): number
    {
        return this._characterMaximumManaPoints;
    }
    public get characterMaximumSkillPoints(): number
    {
        return this._characterMaximumSkillPoints;
    }
    public get characterMaximumHorizontalSpeedUponJoystickNeutral(): number {
        return this._characterMaximumHorizontalSpeedUponJoystickNeutral;
    }
    public get characterMaximumHorizontalSpeedUponJoystickFullyActive(): number {
        return this._characterMaximumHorizontalSpeedUponJoystickFullyActive;
    }
    public get characterMaximumVerticalSpeed(): number {
        return this._characterMaximumVerticalSpeed;
    }
    public get characterVerticalJumpVelocity(): number {
        return this._characterVerticalJumpVelocity;
    }
    public get characterGroundFriction(): number {
        return this._characterGroundFriction;
    }
    public get characterGravitationalAcceleration(): number {
        if (this.isCharacterOnWorldSurface.get(World.WALL_KEY)) return this._characterWallSlideGravitationalAcceleration;
        if (this._characterInputController.isJumpActive) return this._characterGravitionalAccelerationUponHoldingJump;
        return this._characterNormalGravititationalAcceleration;
    }

    // Character State
    public get healthPoints(): number
    {
        return this._healthPoints;
    }
    public get manaPoints(): number
    {
        return this._manaPoints;
    }
    public get canWallJumpNow(): boolean {
        return this._canWallJumpNow;
    }
    public get lastWallWallJumpedFrom(): BABYLON.Nullable<AbstractMesh>
    {
        return this._lastWallWallJumpedFrom;
    }
    public get jumpState(): boolean
    {
        return this._jumpState;
    }

    public set characterHeight(height: number) {
        if (this._characterHeight) return;
        this._characterHeight = height;
    }

    public set mesh(mesh: BABYLON.Mesh) {
        if (this._mesh) return;
        this._mesh = mesh;
    }

    public set characterWorld(world: World) {
        if (this._characterWorld) return;
        this._characterWorld = world;
    }


    public setPositionAndRotation(
        pos: BABYLON.Vector3,
        rot: BABYLON.Quaternion
    ): Character {
        this._characterPosition = this.mesh.position = pos;
        this._characterOrientation = this.mesh.rotationQuaternion = rot;
        return this;
    }

    protected checkCollisions(): void {
        this._characterWorld.collidablesPerType.forEach((collidables, key) => {
            let ray: BABYLON.Ray = new BABYLON.Ray(this._characterPosition,
                this._characterVelocity.length() == 0 ? BABYLON.Vector3.Down() : this._characterVelocity, this._characterHeight / 2);
            let hit: BABYLON.Nullable<BABYLON.PickingInfo> = this._characterWorld.gameEngine.babylonScene.pickWithRay(ray,
                (mesh: BABYLON.AbstractMesh) => {
                    return collidables.map((collidable) => collidable.babylonMesh).includes(mesh);
                });
            this.isCharacterOnWorldSurface.set(key, !!(hit && hit.pickedPoint));
        });
    }

    public accelerateAndRotateHorizontalComponents(x: number, z: number): void {
        let r = Math.sqrt(x ** 2 + z ** 2);

        if (r > 0.01) { // Deadzone
            let r1 = Math.abs(x) + Math.abs(z);
            x *= r / r1;
            z *= r / r1;

            if (this.isCharacterOnWorldSurface.get(World.GROUND_KEY)) {
                this.mesh.rotationQuaternion = BABYLON.Vector3.Up()
                    .scale(Math.atan2(z, x))
                    .toQuaternion();

                this._characterRayOfView.set(z, 0.0, x).normalize();
            }

            this._characterVelocity.set(
                this._characterVelocity.x + this.horizontalMovementScaleFactor * z,
                this._characterVelocity.y,
                this._characterVelocity.z + this.horizontalMovementScaleFactor * x
            )
        }

        if (this.isCharacterOnWorldSurface.get(World.GROUND_KEY)) {
            this._characterVelocity.set(this.characterGroundFriction * this._characterVelocity.x, this._characterVelocity.y, this.characterGroundFriction * this._characterVelocity.z);
        }
    }

    public preformJump(): void {
        this._characterVelocity.y = this.characterVerticalJumpVelocity;
    }

    public preformWallJump(): void {
        if (!this._characterRayOfView) return;
        let ray: BABYLON.Ray = new BABYLON.Ray(this._characterPosition, this._characterRayOfView, this._characterHeight / 2);
        let rayHelper: BABYLON.RayHelper = new BABYLON.RayHelper(ray);
        rayHelper.show(this._characterWorld.gameEngine.babylonScene, BABYLON.Color3.Red());
        let hit: BABYLON.Nullable<BABYLON.PickingInfo> = this._characterWorld.gameEngine.babylonScene.pickWithRay(ray,
            (mesh: BABYLON.AbstractMesh) => {
                let walls = this._characterWorld.collidablesPerType.get(World.WALL_KEY);
                if (!walls) return false;
                return walls.map((wall) => wall.babylonMesh).includes(mesh);
            });
        if (!hit) return;
        if (!hit.pickedMesh) return;
        let wall: BABYLON.AbstractMesh = hit.pickedMesh;
        if (this._lastWallWallJumpedFrom == wall) {
            let normalVectorNullable: BABYLON.Nullable<BABYLON.Vector3> = hit.getNormal(true);
            if (!normalVectorNullable) return;
            let normalVector: BABYLON.Vector3 = normalVectorNullable;
            console.debug([wall, normalVector]);
            if (!hit.pickedPoint) return;
            let rayNormal = new BABYLON.Ray(hit.pickedPoint, normalVector, 1);
            new BABYLON.RayHelper(rayNormal).show(
                this._characterWorld.gameEngine.babylonScene,
                BABYLON.Color3.Blue()
            );
            let normal: BABYLON.Quaternion = new BABYLON.Quaternion(
                normalVector.x,
                normalVector.y,
                normalVector.z,
                0.0
            );
            console.assert(!!this._mesh.rotationQuaternion, "Rotation Quaternion cannot be null");
            this._mesh.rotationQuaternion = normal
                .multiply((this.mesh.rotationQuaternion as BABYLON.Quaternion).multiply(normal))
                .normalize();
            this._characterVelocity.subtractInPlace(
                normalVectorNullable.scale(2 * BABYLON.Vector3.Dot(this.characterVelocity, normalVectorNullable)));
            this._characterVelocity.set(this._characterVelocity.x, this.characterVerticalJumpVelocity, this._characterVelocity.z);
            this._canWallJumpNow = false;
            this._lastWallWallJumpedFrom = wall as BABYLON.AbstractMesh;
        }
    }

    private applyHorizontalMovementInfluences(): void {
        let proportionalityConstant: number = 1.0;
        if (this._characterInputController.isSprintActive && this.isCharacterOnWorldSurface.get(World.GROUND_KEY)) {
            proportionalityConstant = 1.3;
        } else if (this._characterInputController.isSprintActive && !this.isCharacterOnWorldSurface.get(World.GROUND_KEY)) {
            proportionalityConstant = 1.2;
        }
        if (this._characterVelocity.length() ** 2 - this._characterVelocity.y ** 2 > (proportionalityConstant *
            (this._characterMaximumHorizontalSpeedUponJoystickNeutral * (1.0 - this._characterInputController.normalizedHorizontalMovement.length()) +
                this._characterMaximumHorizontalSpeedUponJoystickFullyActive * this._characterInputController.normalizedHorizontalMovement.length())) ** 2) {
            this._characterVelocity.normalizeFromLength(proportionalityConstant *
                (this._characterMaximumHorizontalSpeedUponJoystickNeutral * (1.0 - this._characterInputController.normalizedHorizontalMovement.length()) +
                    this._characterMaximumHorizontalSpeedUponJoystickFullyActive * this._characterInputController.normalizedHorizontalMovement.length()));
        }
    }

    private applyGravity(getDeltaTime: () => number): void {
        if (!this.isCharacterOnWorldSurface.get(World.GROUND_KEY)) {
            this._characterVelocity.y += 0.5 * this.characterGravitationalAcceleration * (getDeltaTime() / 1000.0);
        }
        if (this.isCharacterOnWorldSurface.get(World.GROUND_KEY) && this._characterVelocity.y < 0.0) {
            this._characterVelocity.y = 0.0;
        }
    }

    private capYVelocity(): void {
        if (Math.abs(this._characterVelocity.y) > this.characterMaximumVerticalSpeed) {
            this._characterVelocity.y = this.characterMaximumVerticalSpeed * (this._characterVelocity.y === 0 ? 0 : this._characterVelocity.y > 0 ? 1 : -1);
        }
    }

    private move(getDeltaTime: () => number): void {
        if (this._characterInputController.normalizedHorizontalMovement != null) {
            this.accelerateAndRotateHorizontalComponents(
                this._characterInputController.normalizedHorizontalMovement.x,
                this._characterInputController.normalizedHorizontalMovement.y
            );
        }
        if (!this._characterInputController.isJumpActive) {
            this._jumpState = false;
            this._canWallJumpNow = true;
        } else {
            if (this.isCharacterOnWorldSurface.get(World.GROUND_KEY) && !this._jumpState) {
                this.preformJump();
                this._jumpState = true;
            }
            if (
                this._canWallJumpNow &&
                this.isCharacterOnWorldSurface.get(World.WALL_KEY) &&
                !this.isCharacterOnWorldSurface.get(World.GROUND_KEY) &&
                this._characterInputController.normalizedHorizontalMovement.length() > 0.1
            ) {
                this.preformWallJump();
            }
        }
        if (this.isCharacterOnWorldSurface.get(World.GROUND_KEY)) {
            this._lastWallWallJumpedFrom = null;
        }

        this.applyHorizontalMovementInfluences();
        this.applyGravity(getDeltaTime);
        this.capYVelocity();

        let deltaPos = this._characterVelocity.scale(getDeltaTime() / 1000.0);

        if (deltaPos.length() > 0) {
            this._characterWorld.collidablesPerType.forEach((collidables, _key) => {
                let ray: BABYLON.Ray = new BABYLON.Ray(this._characterPosition, deltaPos, deltaPos.length());
                let hit: BABYLON.Nullable<BABYLON.PickingInfo> = this._characterWorld.gameEngine.babylonScene.pickWithRay(ray,
                    (mesh: BABYLON.AbstractMesh) => {
                        return collidables.map((collidable) => collidable.babylonMesh).includes(mesh);
                    });
                if (hit && hit.pickedPoint) {
                    this._mesh.position = this._characterPosition = hit.pickedPoint as BABYLON.Vector3;
                } else {
                    this._mesh.position = this._characterPosition = this._characterPosition.add(deltaPos);
                }
            });
        }
        console.assert(!!this._mesh.rotationQuaternion, "Rotation quaternion cannot be undefined");
        this._characterOrientation = this._mesh.rotationQuaternion as BABYLON.Quaternion;
        this.checkCollisions();
        this.applyGravity(getDeltaTime);
        this.capYVelocity();
    }

    public preformTick(getDeltaTime: () => number): void {
        this.checkCollisions();
        this._characterInputController.preformTick(this, this._characterWorld);
        this.move(getDeltaTime);
    }

    protected get horizontalMovementScaleFactor() {
        return this.isCharacterOnWorldSurface.get(World.GROUND_KEY) ? 5.0 : 1.0;
    }
}