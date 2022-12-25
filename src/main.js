import * as BABYLON from "@babylonjs/core";
import * as Ammo from "ammo.js";

console.clear();

var canvas = document.getElementById("renderCanvas");

var engine = null;
var scene = null;
var sceneToRender = null;
var createDefaultEngine = () => {
  return new BABYLON.Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    disableWebGL2Support: false,
  });
};

/* Start Code */
var createScene = () => {
  var scene = new BABYLON.Scene(engine);
  var gravity = new BABYLON.Vector3(0, -100, 0);
  scene.enablePhysics(gravity, new BABYLON.AmmoJSPlugin(true, Ammo));
  var deviceSourceManager = new BABYLON.DeviceSourceManager(scene.getEngine());
  // Lights
  var _lightHemi = new BABYLON.HemisphericLight(
    "hemi",
    new BABYLON.Vector3(0, 1, 0),
    scene
  );
  //Simple crate
  var player = BABYLON.MeshBuilder.CreateCapsule(
    "player",
    { radius: 0.75, height: 3 },
    scene
  );
  player.material = new BABYLON.StandardMaterial("playerMat", scene);
  player.material.diffuseTexture = new BABYLON.Texture(
    "textures/crate.png",
    scene
  );
  player.material.diffuseTexture.hasAlpha = true;
  player.position = new BABYLON.Vector3(5, -5, -10);
  player.physicsImpostor = new BABYLON.PhysicsImpostor(
    player,
    BABYLON.PhysicsImpostor.CapsuleImpostor,
    { mass: 1 },
    scene
  );
  player.onGround = true;

  var camera = new BABYLON.ArcFollowCamera(
    "camera",
    Math.PI / 2,
    0.5,
    10,
    player,
    scene
  );
  //camera.rotationOffset = 0.5;
  camera.orthoBottom = -10;
  camera.orthoLeft = -10;
  camera.orthoRight = 10;
  camera.orthoTop = 10;
  //camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
  if (camera.mode === BABYLON.Camera.ORTHOGRAPHIC_CAMERA) {
    camera.beta = 0;
  } else {
    camera.beta = 0.25;
  }

  var grounds = [];
  var walls = [];
  /*var ceilings = [];*/
  //Ground
  var ground = BABYLON.MeshBuilder.CreateBox(
    "ground",
    { width: 20.0, depth: 20.0, height: 0.5 },
    scene
  );
  ground.material = new BABYLON.StandardMaterial("groundMat", scene);
  //ground.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
  ground.material.backFaceCulling = false;
  ground.position = new BABYLON.Vector3(5, -10, -15);
  ground.rotation = new BABYLON.Vector3(0, 0, 0);
  ground.physicsImpostor = new BABYLON.PhysicsImpostor(
    ground,
    BABYLON.PhysicsImpostor.BoxImpostor,
    { mass: 0, friction: 1 },
    scene
  );
  grounds.push(ground);

  var wall = BABYLON.MeshBuilder.CreateBox(
    "wall",
    { width: 15, height: 15, depth: 0.75 },
    scene
  );
  wall.material = new BABYLON.StandardMaterial("wallMat", scene);
  //wall.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
  wall.material.backFaceCulling = false;
  wall.position = new BABYLON.Vector3(3.2, -2.5, -15);
  wall.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);
  wall.physicsImpostor = new BABYLON.PhysicsImpostor(
    wall,
    BABYLON.PhysicsImpostor.BoxImpostor,
    { mass: 0, friction: 10 },
    scene
  );
  //wall.setEnabled(false);
  walls.push(wall);

  var wall2 = BABYLON.MeshBuilder.CreateBox(
    "wall2",
    { width: 15, height: 15, depth: 0.75 },
    scene
  );
  wall2.material = wall.material;
  wall2.position = new BABYLON.Vector3(6.8, -2.5, -15);
  wall2.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);
  wall2.physicsImpostor = new BABYLON.PhysicsImpostor(
    wall2,
    BABYLON.PhysicsImpostor.BoxImpostor,
    { mass: 0, friction: 10 },
    scene
  );
  //wall2.setEnabled(false);
  walls.push(wall2);

  var platform = BABYLON.MeshBuilder.CreateBox(
    "platform1",
    { width: 5.0, depth: 5.0, height: 0.5 },
    scene
  );
  platform.material = wall.material;
  platform.position = new BABYLON.Vector3(17, -10, -10);
  platform.physicsImpostor = new BABYLON.PhysicsImpostor(
    platform,
    BABYLON.PhysicsImpostor.BoxImpostor,
    { mass: 0 },
    scene
  );
  grounds.push(platform);

  var dbox = BABYLON.MeshBuilder.CreateBox(
    "dbox",
    { width: 1, height: 2, depth: 1 },
    scene
  );
  dbox.position = wall.position;
  dbox.material = new BABYLON.StandardMaterial("dboxMat", scene);
  //dbox.material.diffuseColor = new BABYLON.Color3(0, 1, 1);
  dbox.material.backFaceCulling = false;
  dbox.setEnabled(false);

  // Enable Collisions
  scene.collisionsEnabled = true;
  //Then apply collisions and gravity to the active camera
  //camera.checkCollisions = true;
  //Set the ellipsoid around the camera (e.g. your player's size)
  //camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);
  //finally, say which mesh will be collisionable
  //box.checkCollisions = true;

  var calcCh = function (x, y) {
    return Math.sqrt(x ** 2 + y ** 2);
  };

  var moveCh = function (ch, x, y, onGround, onWall, isSprinting) {
    var r = calcCh(x, y);

    if (r > 0.01) {
      let r1 = Math.abs(x) + Math.abs(y);
      x *= r / r1;
      y *= r / r1;
      var dir = new BABYLON.Vector3(
        -x * Math.cos(camera.alpha) - y * Math.sin(camera.alpha),
        0,
        y * Math.cos(camera.alpha) - x * Math.sin(camera.alpha)
      );

      if (onGround) {
        ch.setDirection(dir);
      }

      var vel = ch.physicsImpostor.getLinearVelocity();
      ch.physicsImpostor.setLinearVelocity(
        vel.add(dir.scale(onGround ? 1.5 : 0.8))
      );
    }
  };

  var jumpCh = function (ch) {
    var vel = ch.physicsImpostor.getLinearVelocity();
    ch.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(vel.x, 28, vel.z));
  };

  var canWallJump = true;
  var lastWall = null;
  var wallJumpCh = function (ch, wall) {
    if (lastWall !== wall) {
      ch.physicsImpostor.setLinearVelocity(
        ch.getDirection(new BABYLON.Vector3(0, 30, -60))
      );
      ch.setDirection(ch.getDirection(new BABYLON.Vector3(0, 0, -60)));
      canWallJump = false;
      lastWall = wall;
    }
  };

  var hasJumped = false;

  scene.onBeforeRenderObservable.add(function (evt) {
    if (camera.mode === BABYLON.Camera.ORTHOGRAPHIC_CAMERA) {
      camera.beta = 0;
    } else {
      camera.beta = 0.25;
    }

    var onGround = grounds
      .map((gnd) =>
        player.intersectsMesh(gnd, false)
          ? player.intersectsMesh(gnd, true)
          : false
      )
      .reduce((p, c) => p || c, false);
    var onWall = walls.map((wll) => [
      wll,
      player.intersectsMesh(wll, false)
        ? player.intersectsMesh(wll, true)
        : false,
    ]);
    var maxHSpeed = 10.0;
    var isSprinting = false;
    var isJumping = false;
    var moveArray = [];
    if (deviceSourceManager.getDeviceSource(BABYLON.DeviceType.Keyboard)) {
      let keyboardSource = deviceSourceManager.getDeviceSource(
        BABYLON.DeviceType.Keyboard
      );
      isSprinting =
        isSprinting ||
        keyboardSource.getInput(16) === 0 ||
        keyboardSource.getInput(76) === 0;
      moveArray.push([
        keyboardSource.getInput(87) - keyboardSource.getInput(83),
        keyboardSource.getInput(68) - keyboardSource.getInput(65),
        player,
        onGround,
        onWall,
        isSprinting,
      ]);
      moveArray.push([
        keyboardSource.getInput(38) - keyboardSource.getInput(40),
        keyboardSource.getInput(39) - keyboardSource.getInput(37),
        player,
        onGround,
        onWall,
        isSprinting,
      ]);
      isJumping =
        isJumping ||
        keyboardSource.getInput(32) === 1 ||
        keyboardSource.getInput(74) === 1;
    }
    if (deviceSourceManager.getDeviceSource(BABYLON.DeviceType.Generic)) {
      let gamepadSource = deviceSourceManager.getDeviceSource(
        BABYLON.DeviceType.Generic
      );
      isSprinting =
        isSprinting ||
        gamepadSource.getInput(0) === 1 ||
        gamepadSource.getInput(3) === 1;
      moveArray.push([
        -gamepadSource.getInput(15),
        gamepadSource.getInput(14),
        player,
        onGround,
        onWall,
        isSprinting,
      ]);
      isJumping =
        isJumping ||
        gamepadSource.getInput(1) === 1 ||
        gamepadSource.getInput(2) === 1;
    }
    if (deviceSourceManager.getDeviceSource(BABYLON.DeviceType.Switch)) {
      let gamepadSource = deviceSourceManager.getDeviceSource(
        BABYLON.DeviceType.Switch
      );
      isSprinting =
        isSprinting ||
        gamepadSource.getInput(3) === 1 ||
        gamepadSource.getInput(2) === 1;
      moveArray.push([
        -gamepadSource.getInput(23),
        gamepadSource.getInput(22),
        player,
        onGround,
        onWall,
        isSprinting,
      ]);
      isJumping =
        isJumping ||
        gamepadSource.getInput(0) === 1 ||
        gamepadSource.getInput(1) === 1;
    }
    if (deviceSourceManager.getDeviceSource(BABYLON.DeviceType.DualShock)) {
      let gamepadSource = deviceSourceManager.getDeviceSource(
        BABYLON.DeviceType.DualShock
      );
      isSprinting =
        isSprinting ||
        gamepadSource.getInput(3) === 1 ||
        gamepadSource.getInput(2) === 1;
      moveArray.push([
        -gamepadSource.getInput(19),
        gamepadSource.getInput(18),
        player,
        onGround,
        onWall,
        isSprinting,
      ]);
      isJumping =
        isJumping ||
        gamepadSource.getInput(0) === 1 ||
        gamepadSource.getInput(1) === 1;
    }
    //console.log(moveArray);
    let moveRslt = moveArray.reduce(
      (p, c, i) => {
        var r = calcCh(c[0], c[1]);
        return p[0] < r ? [r, i] : p;
      },
      [0, null]
    );
    maxHSpeed *= moveRslt[0];
    if (moveRslt[1] != null) {
      moveCh(
        moveArray[moveRslt[1]][2],
        moveArray[moveRslt[1]][0],
        moveArray[moveRslt[1]][1],
        moveArray[moveRslt[1]][3],
        moveArray[moveRslt[1]][4],
        moveArray[moveRslt[1]][5]
      );
    }
    if (!isJumping) {
      hasJumped = false;
    }
    if (isJumping) {
      if (onGround && !hasJumped) {
        jumpCh(player);
        hasJumped = true;
      }
      if (canWallJump && !onGround && maxHSpeed > 0.1) {
        onWall.forEach((e) => {
          if (e[1]) {
            wallJumpCh(player, e[0]);
          }
        });
      }
      if (!onGround && !onWall.reduce((p, c) => p || c[1], false)) {
        var vel = player.physicsImpostor.getLinearVelocity();
        player.physicsImpostor.setLinearVelocity(
          vel.add(new BABYLON.Vector3(0, 0.5, 0))
        );
      }
    } else {
      canWallJump = true;
    }
    if (onGround) {
      lastWall = null;
    }
    vel = player.physicsImpostor.getLinearVelocity();
    var velxz = new BABYLON.Vector3(vel.x, 0, vel.z);
    if (isSprinting && onGround) {
      maxHSpeed *= 1.3;
    } else if (isSprinting && !onGround) {
      maxHSpeed *= 1.2;
    }
    if (velxz.length() > maxHSpeed) {
      velxz = velxz.normalize().scale(maxHSpeed);
    }
    var vely = vel.y;
    if (Math.abs(vely) > 50) {
      vely = 50 * (vely === 0 ? 0 : vely > 0 ? 1 : -1);
    }
    player.physicsImpostor.setLinearVelocity(
      new BABYLON.Vector3(velxz.x, vely, velxz.z)
    );
    player.physicsImpostor.setAngularVelocity(BABYLON.Vector3.Zero());
    var dir = new BABYLON.Vector3(0, 0, 1);
    dir.rotateByQuaternionToRef(player.rotationQuaternion, dir);
    dir.y = 0;
    player.setDirection(dir);
    player.physicsImpostor.setDeltaRotation(player.rotationQuaternion);
  });
  var meshesColliderList = [];
  for (var i = 1; i < scene.meshes.length; i++) {
    if (
      scene.meshes[i].checkCollisions &&
      scene.meshes[i].isVisible === false
    ) {
      scene.meshes[i].physicsImpostor = new BABYLON.PhysicsImpostor(
        scene.meshes[i],
        BABYLON.PhysicsImpostor.BoxImpostor,
        { mass: 0, friction: 0.5, restitution: 0.7 },
        scene
      );
      meshesColliderList.push(scene.meshes[i]);
    }
  }

  //new BABYLON.AsciiArtPostProcess("pp", camera, "ariel").activate(camera);
  return scene;
};
/* End Code */
var initFunction = async function () {
  var asyncEngineCreation = async function () {
    try {
      return createDefaultEngine();
    } catch (e) {
      console.error("The available createEngine function failed.");
      console.error(e);
      return null;
    }
  };

  engine = await asyncEngineCreation();
  if (!engine) throw new Error("engine should not be null.");
  scene = createScene();
};
initFunction().then(() => {
  sceneToRender = scene;
  engine.runRenderLoop(function () {
    if (sceneToRender && sceneToRender.activeCamera) {
      sceneToRender.render();
    }
  });
});

// Resize
window.addEventListener("resize", function () {
  engine.resize();
});