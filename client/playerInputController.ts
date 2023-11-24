/**
 * ALL RIGHTS RESERVED Codetoil (c) 2021-2022
 */

import * as BABYLON from "@babylonjs/core";

export class PlayerInputController {
  private deviceSourceManager: BABYLON.DeviceSourceManager;
  public sprintHeld: boolean;
  public jumpPressed: boolean;
  public joystick: BABYLON.Vector3;

  public constructor(engine: BABYLON.Engine) {
    this.deviceSourceManager = new BABYLON.DeviceSourceManager(engine);
    this.joystick = new BABYLON.Vector3(0, 0, 0);
    this.sprintHeld = false;
    this.jumpPressed = false;
  }

  private setJoystickIfBigger(x: number, z: number) {
    if (x ** 2 + z ** 2 > this.joystick.lengthSquared()) {
      this.joystick.x = x;
      this.joystick.z = z;
    }
  }

  public tick(cameraAngle: BABYLON.Quaternion) {
    this.sprintHeld = false;
    this.jumpPressed = false;
    this.joystick = this.joystick.scale(0.0);
    if (this.deviceSourceManager.getDeviceSource(BABYLON.DeviceType.Keyboard)) {
      let keyboardSource = this.deviceSourceManager.getDeviceSource(
        BABYLON.DeviceType.Keyboard
      ) as BABYLON.DeviceSource<BABYLON.DeviceType.Keyboard>;
      this.sprintHeld =
        this.sprintHeld ||
        keyboardSource.getInput(16) === 1 ||
        keyboardSource.getInput(76) === 1;
      this.jumpPressed =
        this.jumpPressed ||
        keyboardSource.getInput(32) === 1 ||
        keyboardSource.getInput(74) === 1;
      this.setJoystickIfBigger(
        keyboardSource.getInput(87) - keyboardSource.getInput(83),
        keyboardSource.getInput(68) - keyboardSource.getInput(65)
      );
      this.setJoystickIfBigger(
        keyboardSource.getInput(38) - keyboardSource.getInput(40),
        keyboardSource.getInput(39) - keyboardSource.getInput(37)
      );
    }
    if (this.deviceSourceManager.getDeviceSource(BABYLON.DeviceType.Generic)) {
      let gamepadSource = this.deviceSourceManager.getDeviceSource(
        BABYLON.DeviceType.Generic
      ) as BABYLON.DeviceSource<BABYLON.DeviceType.Generic>;
      this.sprintHeld =
        this.sprintHeld ||
        gamepadSource.getInput(0) === 1 ||
        gamepadSource.getInput(3) === 1;
      this.setJoystickIfBigger(
        -gamepadSource.getInput(15),

        gamepadSource.getInput(14)
      );
      this.jumpPressed =
        this.jumpPressed ||
        gamepadSource.getInput(1) === 1 ||
        gamepadSource.getInput(2) === 1;
    }
    if (this.deviceSourceManager.getDeviceSource(BABYLON.DeviceType.Switch)) {
      let gamepadSource = this.deviceSourceManager.getDeviceSource(
        BABYLON.DeviceType.Switch
      ) as BABYLON.DeviceSource<BABYLON.DeviceType.Switch>;
      this.sprintHeld =
        this.sprintHeld ||
        gamepadSource.getInput(3) === 1 ||
        gamepadSource.getInput(2) === 1;
      this.setJoystickIfBigger(
        -gamepadSource.getInput(23),
        gamepadSource.getInput(22)
      );
      this.jumpPressed =
        this.jumpPressed ||
        gamepadSource.getInput(0) === 1 ||
        gamepadSource.getInput(1) === 1;
    }
    if (
      this.deviceSourceManager.getDeviceSource(BABYLON.DeviceType.DualShock)
    ) {
      let gamepadSource = this.deviceSourceManager.getDeviceSource(
        BABYLON.DeviceType.DualShock
      ) as BABYLON.DeviceSource<BABYLON.DeviceType.DualShock>;
      this.sprintHeld =
        this.sprintHeld ||
        gamepadSource.getInput(3) === 1 ||
        gamepadSource.getInput(2) === 1;
      this.setJoystickIfBigger(
        -gamepadSource.getInput(19),
        gamepadSource.getInput(18)
      );
      this.jumpPressed =
        this.jumpPressed ||
        gamepadSource.getInput(0) === 1 ||
        gamepadSource.getInput(1) === 1;
    }
    this.joystick.rotateByQuaternionToRef(cameraAngle, this.joystick);
    //console.debug(this.joystick);
  }
}
