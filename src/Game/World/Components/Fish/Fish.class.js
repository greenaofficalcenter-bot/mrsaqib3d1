import * as THREE from 'three';
import Game from '../../../Game.class';
import EnvironmentTimeManager from '../../Managers/EnvironmentManager/EnvironmentManager.class';
import SeasonManager from '../../Managers/SeasonManager/SeasonManager.class';

export default class Fish {
  constructor(biomeManager) {
    this.game = Game.getInstance();
    this.scene = this.game.scene;
    this.biomeManager = biomeManager;
    this.environmentTimeManager = EnvironmentTimeManager.getInstance();
    this.seasonManager = SeasonManager.getInstance();

    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.fishes = [];
    this.ripples = [];
    this.fishCount = 15;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.waterPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.06);

    this.createSharedMaterials();
    this.initFishes();
    this.initRipplePool();
    this.bindInteraction();
  }

  createSharedMaterials() {
    this.speciesPalettes = [
      {
        // Kohaku (White with vibrant vermilion-orange patches)
        name: 'kohaku',
        body: 0xfff8f2,
        patch1: 0xff4d1c,
        patch2: 0xff6b35,
        fin: 0xfff3eb,
        scale: 1.08,
      },
      {
        // Yamabuki Ogon (Lustrous Golden Koi)
        name: 'yamabuki',
        body: 0xffbe2e,
        patch1: 0xff9f1c,
        patch2: 0xffe169,
        fin: 0xffe680,
        scale: 1.15,
      },
      {
        // Showa / Sanke (Calico White, Crimson, and Sumi Black)
        name: 'showa',
        body: 0xfbf7f4,
        patch1: 0xe63926,
        patch2: 0x1e2229,
        fin: 0xffdfd6,
        scale: 1.0,
      },
      {
        // River Trout / Silver-Teal Stream Fish
        name: 'trout',
        body: 0x7cb0b8,
        patch1: 0x457b82,
        patch2: 0xd9a773,
        fin: 0xaed4db,
        scale: 0.88,
      },
    ];

    this.eyeMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.2,
    });
  }

  createFishMesh(palette) {
    const fishRoot = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({
      color: palette.body,
      roughness: 0.22,
      metalness: 0.08,
    });

    const patch1Mat = new THREE.MeshStandardMaterial({
      color: palette.patch1,
      roughness: 0.25,
      metalness: 0.06,
    });

    const patch2Mat = new THREE.MeshStandardMaterial({
      color: palette.patch2,
      roughness: 0.28,
      metalness: 0.05,
    });

    const finMat = new THREE.MeshStandardMaterial({
      color: palette.fin,
      roughness: 0.3,
      transparent: true,
      opacity: 0.86,
      side: THREE.DoubleSide,
    });

    // Anterior torso (streamlined fusiform)
    const torsoGeo = new THREE.SphereGeometry(0.085, 14, 10);
    torsoGeo.scale(0.85, 0.42, 1.95);
    const torso = new THREE.Mesh(torsoGeo, bodyMat);
    torso.castShadow = false;
    fishRoot.add(torso);

    // Head cap
    const headGeo = new THREE.ConeGeometry(0.068, 0.14, 12);
    headGeo.rotateX(Math.PI / 2);
    headGeo.scale(1.0, 0.48, 1.0);
    const head = new THREE.Mesh(headGeo, bodyMat);
    head.position.set(0, -0.002, 0.17);
    fishRoot.add(head);

    // Koi markings on the back so they stand out from above
    const spot1Geo = new THREE.SphereGeometry(0.058, 10, 8);
    spot1Geo.scale(0.95, 0.28, 1.35);
    const spot1 = new THREE.Mesh(spot1Geo, patch1Mat);
    spot1.position.set(0.008, 0.025, 0.045);
    fishRoot.add(spot1);

    const spot2Geo = new THREE.SphereGeometry(0.046, 10, 8);
    spot2Geo.scale(0.85, 0.25, 1.15);
    const spot2 = new THREE.Mesh(spot2Geo, patch2Mat);
    spot2.position.set(-0.01, 0.024, -0.055);
    fishRoot.add(spot2);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.013, 8, 8);
    const leftEye = new THREE.Mesh(eyeGeo, this.eyeMaterial);
    leftEye.position.set(0.048, 0.012, 0.145);
    const rightEye = new THREE.Mesh(eyeGeo, this.eyeMaterial);
    rightEye.position.set(-0.048, 0.012, 0.145);
    fishRoot.add(leftEye, rightEye);

    // Dorsal fin
    const dorsalGeo = new THREE.ConeGeometry(0.028, 0.12, 5);
    dorsalGeo.rotateX(-Math.PI * 0.38);
    dorsalGeo.scale(0.32, 0.85, 1.1);
    const dorsalFin = new THREE.Mesh(dorsalGeo, patch1Mat);
    dorsalFin.position.set(0, 0.042, -0.015);
    fishRoot.add(dorsalFin);

    // Left & Right Pectoral fins (animated)
    const pecGeo = new THREE.ConeGeometry(0.042, 0.11, 5);
    pecGeo.rotateZ(Math.PI / 2);
    pecGeo.scale(1.0, 0.15, 0.65);

    const leftPecPivot = new THREE.Group();
    leftPecPivot.position.set(0.06, -0.006, 0.065);
    const leftPec = new THREE.Mesh(pecGeo, finMat);
    leftPec.position.set(0.042, 0, -0.015);
    leftPec.rotation.y = -0.35;
    leftPecPivot.add(leftPec);
    fishRoot.add(leftPecPivot);

    const rightPecPivot = new THREE.Group();
    rightPecPivot.position.set(-0.06, -0.006, 0.065);
    const rightPec = new THREE.Mesh(pecGeo, finMat);
    rightPec.position.set(-0.042, 0, -0.015);
    rightPec.rotation.z = Math.PI;
    rightPec.rotation.y = 0.35;
    rightPecPivot.add(rightPec);
    fishRoot.add(rightPecPivot);

    // Posterior Mid-Body Pivot (for articulated S-curve swimming)
    const midTailPivot = new THREE.Group();
    midTailPivot.position.set(0, 0, -0.11);
    fishRoot.add(midTailPivot);

    const midBodyGeo = new THREE.ConeGeometry(0.062, 0.16, 10);
    midBodyGeo.rotateX(-Math.PI / 2);
    midBodyGeo.scale(0.85, 0.42, 1.0);
    const midBody = new THREE.Mesh(midBodyGeo, bodyMat);
    midBody.position.set(0, 0, -0.06);
    midTailPivot.add(midBody);

    // Caudal (Tail) Fin Pivot
    const tailFinPivot = new THREE.Group();
    tailFinPivot.position.set(0, 0, -0.13);
    midTailPivot.add(tailFinPivot);

    const upperTailGeo = new THREE.ConeGeometry(0.045, 0.14, 5);
    upperTailGeo.rotateX(-Math.PI * 0.42);
    upperTailGeo.scale(0.22, 1.0, 0.9);
    const upperTail = new THREE.Mesh(upperTailGeo, finMat);
    upperTail.position.set(0, 0.015, -0.055);

    const lowerTailGeo = new THREE.ConeGeometry(0.038, 0.12, 5);
    lowerTailGeo.rotateX(-Math.PI * 0.58);
    lowerTailGeo.scale(0.22, 1.0, 0.85);
    const lowerTail = new THREE.Mesh(lowerTailGeo, patch1Mat);
    lowerTail.position.set(0, -0.01, -0.05);

    tailFinPivot.add(upperTail, lowerTail);

    const s = palette.scale * (0.85 + Math.random() * 0.35);
    fishRoot.scale.set(s, s * 0.65, s);

    return {
      root: fishRoot,
      midTailPivot,
      tailFinPivot,
      leftPecPivot,
      rightPecPivot,
      materials: [bodyMat, patch1Mat, patch2Mat, finMat],
    };
  }

  initFishes() {
    for (let i = 0; i < this.fishCount; i++) {
      const palette =
        this.speciesPalettes[i % this.speciesPalettes.length];
      const fishParts = this.createFishMesh(palette);

      const startPos = this.biomeManager.getRandomWaterPoint(0.58);
      const targetPos = this.biomeManager.getRandomWaterPoint(0.58);

      fishParts.root.position.copy(startPos);
      fishParts.root.position.y = 0.052 + (i % 4) * 0.006;

      this.group.add(fishParts.root);

      this.fishes.push({
        ...fishParts,
        position: fishParts.root.position,
        target: targetPos,
        baseY: fishParts.root.position.y,
        speed: 0.38 + Math.random() * 0.32,
        boostSpeed: 0,
        turnSpeed: 2.2 + Math.random() * 1.4,
        heading: Math.random() * Math.PI * 2,
        swimPhase: Math.random() * Math.PI * 2,
        swimFreq: 7.5 + Math.random() * 3.0,
        rippleTimer: 1.5 + Math.random() * 4.5,
      });
    }
  }

  initRipplePool() {
    this.rippleGeometry = new THREE.RingGeometry(0.04, 0.075, 28);
    this.rippleGeometry.rotateX(-Math.PI / 2);

    for (let i = 0; i < 18; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.0,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(this.rippleGeometry, mat);
      mesh.visible = false;
      mesh.position.y = 0.104;
      this.group.add(mesh);

      this.ripples.push({
        mesh,
        mat,
        active: false,
        age: 0,
        maxAge: 1.8,
        maxScale: 4.5,
      });
    }
  }

  spawnRipple(x, z, maxScale = 4.2, duration = 1.7) {
    if (this.seasonManager.currentSeason === 'winter') return;

    const ripple = this.ripples.find((r) => !r.active);
    if (!ripple) return;

    ripple.active = true;
    ripple.age = 0;
    ripple.maxAge = duration;
    ripple.maxScale = maxScale;
    ripple.mesh.position.set(x, 0.104, z);
    ripple.mesh.scale.setScalar(0.25);
    ripple.mat.opacity = 0.52;
    ripple.mesh.visible = true;
  }

  bindInteraction() {
    this.onPointerDown = (event) => {
      if (
        event.target &&
        event.target.closest(
          'a, button, input, .saqib-glass-card, #control-panel, #saqib-topbar'
        )
      ) {
        return;
      }


      const rect = this.game.renderer.rendererInstance.domElement.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(
        this.mouse,
        this.game.camera.cameraInstance
      );

      const hitPoint = new THREE.Vector3();
      if (this.raycaster.ray.intersectPlane(this.waterPlane, hitPoint)) {
        const depth = this.biomeManager.getWaterDepth(hitPoint.x, hitPoint.z);
        if (depth > 0.35) {
          this.spawnRipple(hitPoint.x, hitPoint.z, 6.2, 2.0);
          setTimeout(() => {
            this.spawnRipple(hitPoint.x, hitPoint.z, 4.4, 1.6);
          }, 220);

          // Nearby fish dart or gather curiously
          this.fishes.forEach((fish) => {
            const dist = fish.position.distanceTo(hitPoint);
            if (dist < 3.2) {
              fish.boostSpeed = 0.85;
              fish.target.copy(
                this.biomeManager.getRandomWaterPoint(0.6)
              );
            }
          });
        }
      }
    };

    window.addEventListener('pointerdown', this.onPointerDown);
  }

  pickNextWaterTarget(currentPos) {
    for (let i = 0; i < 25; i++) {
      const candidate = this.biomeManager.getRandomWaterPoint(0.58);
      if (candidate.distanceTo(currentPos) > 1.2) {
        return candidate;
      }
    }
    return this.biomeManager.getRandomWaterPoint(0.5);
  }

  update(delta, elapsedTime) {
    const dt = Math.min(delta, 0.05);
    const isWinter = this.seasonManager.currentSeason === 'winter';
    const isNight = this.environmentTimeManager.envTime === 'night';
    const speedMult = (isWinter ? 0.35 : 1.0) * (isNight ? 0.65 : 1.0);

    for (let i = 0; i < this.fishes.length; i++) {
      const fish = this.fishes[i];

      // Decay dart boost
      fish.boostSpeed = Math.max(0, fish.boostSpeed - dt * 1.1);
      const activeSpeed = (fish.speed + fish.boostSpeed) * speedMult;

      const toTargetX = fish.target.x - fish.position.x;
      const toTargetZ = fish.target.z - fish.position.z;
      const distSq = toTargetX * toTargetX + toTargetZ * toTargetZ;

      if (distSq < 0.35) {
        fish.target.copy(this.pickNextWaterTarget(fish.position));
      }

      const desiredHeading = Math.atan2(toTargetX, toTargetZ);
      let angleDiff = desiredHeading - fish.heading;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      fish.heading += angleDiff * Math.min(1.0, dt * fish.turnSpeed);

      const nextX = fish.position.x + Math.sin(fish.heading) * activeSpeed * dt;
      const nextZ = fish.position.z + Math.cos(fish.heading) * activeSpeed * dt;

      // Verify next position stays inside deeper lake region
      const nextDepth = this.biomeManager.getWaterDepth(nextX, nextZ);
      if (nextDepth >= 0.45) {
        fish.position.x = nextX;
        fish.position.z = nextZ;
      } else {
        // Steer back toward lake center and pick a safe deep waypoint
        fish.target.copy(this.pickNextWaterTarget(fish.position));
        fish.heading += Math.PI * 0.65 * dt;
      }

      // Gentle vertical bobbing & occasional surface nibble
      const surfaceWave = Math.sin(elapsedTime * 1.6 + i * 1.7) * 0.008;
      fish.position.y = (isWinter ? 0.032 : fish.baseY) + surfaceWave;

      // Swim undulation
      fish.swimPhase += dt * fish.swimFreq * (1.0 + fish.boostSpeed * 1.6);
      const bodyWiggle = Math.sin(fish.swimPhase) * 0.09;
      const tailWiggle = Math.sin(fish.swimPhase - 0.8) * 0.34;
      const finWiggle = Math.sin(fish.swimPhase - 1.5) * 0.42;

      fish.root.rotation.y = fish.heading + bodyWiggle;
      fish.root.rotation.z = -angleDiff * 0.18;
      fish.midTailPivot.rotation.y = tailWiggle;
      fish.tailFinPivot.rotation.y = finWiggle;

      const pecAngle = Math.sin(fish.swimPhase * 0.7) * 0.28;
      fish.leftPecPivot.rotation.y = pecAngle;
      fish.rightPecPivot.rotation.y = -pecAngle;

      // Periodic surface ripples when swimming near the surface
      fish.rippleTimer -= dt;
      if (fish.rippleTimer <= 0 && !isWinter) {
        fish.rippleTimer = 2.4 + Math.random() * 4.2;
        this.spawnRipple(
          fish.position.x + Math.sin(fish.heading) * 0.14,
          fish.position.z + Math.cos(fish.heading) * 0.14,
          3.4 + Math.random() * 2.2,
          1.5 + Math.random() * 0.6
        );
      }
    }

    // Update active surface ripple rings
    for (let i = 0; i < this.ripples.length; i++) {
      const r = this.ripples[i];
      if (!r.active) continue;

      r.age += dt;
      const progress = r.age / r.maxAge;
      if (progress >= 1.0) {
        r.active = false;
        r.mesh.visible = false;
      } else {
        const easeOut = 1.0 - Math.pow(1.0 - progress, 2.2);
        const scale = 0.3 + easeOut * r.maxScale;
        r.mesh.scale.setScalar(scale);
        r.mat.opacity = (1.0 - progress) * 0.46;
      }
    }
  }

  dispose() {
    window.removeEventListener('pointerdown', this.onPointerDown);
    if (this.rippleGeometry) this.rippleGeometry.dispose();
    this.ripples.forEach((r) => r.mat.dispose());
    this.fishes.forEach((f) => {
      f.materials.forEach((m) => m.dispose());
    });
    if (this.eyeMaterial) this.eyeMaterial.dispose();
    this.scene.remove(this.group);
  }
}
