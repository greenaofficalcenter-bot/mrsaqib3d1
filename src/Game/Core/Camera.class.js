import * as THREE from 'three';
import Game from '../Game.class';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default class Camera {
  constructor(fov = 25, near = 0.1, far = 200) {
    this.game = Game.getInstance();
    this.canvas = this.game.canvas;
    this.sizes = this.game.sizes;
    this.scene = this.game.scene;

    this.idealRatio = 16 / 9;
    this.ratioOverflow = 0;
    this.initialCameraPosition = null;
    this.adjustedCameraPosition = null;
    this.baseMaxDistance = 35;

    this.setPerspectiveCameraInstance(fov, near, far);
    this.setOrbitControls();

    this.initialCameraPosition = this.cameraInstance.position.clone();
    this.updateCameraForAspectRatio();

    // Cinematic 3D camera fly-through keyframes linked to portfolio scroll
    this.scrollKeyframes = [
      {
        // 0%: Hero — Panoramic Sanctuary Overview
        pos: new THREE.Vector3(18.25, 10.69, 27.32),
        target: new THREE.Vector3(0.0, 0.8, 0.0),
      },
      {
        // 25%: Who I Am & Services — Koi Lake & Water Shimmer
        pos: new THREE.Vector3(7.4, 4.1, 12.6),
        target: new THREE.Vector3(0.5, 0.25, 1.2),
      },
      {
        // 50%: Projects — Wooden Bridge & Perching Songbirds
        pos: new THREE.Vector3(-13.4, 4.7, 9.8),
        target: new THREE.Vector3(-6.2, 1.25, 1.2),
      },
      {
        // 75%: Gallery Picks — Campfire, Tent & Forest Glade
        pos: new THREE.Vector3(-12.2, 4.6, -12.8),
        target: new THREE.Vector3(-4.6, 1.0, -5.5),
      },
      {
        // 100%: Contact & Why Work With Me — High Scenic Horizon Vista
        pos: new THREE.Vector3(14.2, 8.6, -18.2),
        target: new THREE.Vector3(0.0, 1.2, 0.0),
      },
    ];

    this.desiredScrollPos = this.cameraInstance.position.clone();
    this.desiredScrollTarget = new THREE.Vector3(0, 0.8, 0);
    this.controls.target.copy(this.desiredScrollTarget);
    this.isUserDragging = false;
    this.scrollActiveTimer = 0;

    this.controls.addEventListener('start', () => {
      this.isUserDragging = true;
    });
    this.controls.addEventListener('end', () => {
      this.isUserDragging = false;
    });
  }

  setScrollProgress(progress) {
    const clamped = THREE.MathUtils.clamp(progress, 0, 1);
    const totalSegments = this.scrollKeyframes.length - 1;
    const scaled = clamped * totalSegments;
    const idx = Math.min(Math.floor(scaled), totalSegments - 1);
    const localT = scaled - idx;
    // Smoothstep easing between 3D landmarks
    const smoothT = localT * localT * (3 - 2 * localT);

    const k1 = this.scrollKeyframes[idx];
    const k2 = this.scrollKeyframes[idx + 1];

    const ratioScale = 1 + this.ratioOverflow * 0.1;
    this.desiredScrollPos
      .lerpVectors(k1.pos, k2.pos, smoothT)
      .multiplyScalar(ratioScale);
    this.desiredScrollTarget.lerpVectors(k1.target, k2.target, smoothT);
    this.scrollActiveTimer = 1.5;
  }

  setPerspectiveCameraInstance(fov, near, far) {
    const aspectRatio = this.sizes.width / this.sizes.height;
    this.cameraInstance = new THREE.PerspectiveCamera(
      fov,
      aspectRatio,
      near,
      far
    );

    this.cameraInstance.position.set(18.25, 10.69, 27.32);
    this.scene.add(this.cameraInstance);
  }

  setOrbitControls() {
    this.controls = new OrbitControls(this.cameraInstance, this.canvas);
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    this.controls.enableZoom = true;
    this.controls.maxPolarAngle = Math.PI / 2.15;
    this.controls.minPolarAngle = Math.PI / 5;
    this.controls.maxDistance = this.baseMaxDistance;
  }

  updateCameraForAspectRatio() {
    const currentRatio = this.sizes.width / this.sizes.height;
    this.ratioOverflow = Math.max(1, this.idealRatio / currentRatio) - 1;

    const baseDistance = this.initialCameraPosition.length();
    const additionalDistance = baseDistance * this.ratioOverflow * 0.1;

    const direction = this.initialCameraPosition.clone().normalize();
    const newDistance = baseDistance + additionalDistance;

    this.adjustedCameraPosition = direction.multiplyScalar(newDistance);
    this.cameraInstance.position.copy(this.adjustedCameraPosition);

    this.controls.maxDistance = Math.max(this.baseMaxDistance, newDistance);
  }

  resize() {
    const aspectRatio = this.sizes.width / this.sizes.height;
    this.cameraInstance.aspect = aspectRatio;
    this.cameraInstance.updateProjectionMatrix();

    this.updateCameraForAspectRatio();
  }

  update() {
    if (!this.isUserDragging && this.scrollActiveTimer > 0) {
      this.scrollActiveTimer -= 0.016;
      this.cameraInstance.position.lerp(this.desiredScrollPos, 0.06);
      this.controls.target.lerp(this.desiredScrollTarget, 0.06);
    }
    this.controls.update();
  }

  dispose() {
    this.controls.dispose();
    this.scene.remove(this.cameraInstance);
  }
}

