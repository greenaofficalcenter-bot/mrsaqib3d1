import * as THREE from 'three';
import Game from '../../../Game.class';
import EnvironmentTimeManager from '../../Managers/EnvironmentManager/EnvironmentManager.class';
import SeasonManager from '../../Managers/SeasonManager/SeasonManager.class';

export default class Insects {
  constructor(biomeManager) {
    this.game = Game.getInstance();
    this.scene = this.game.scene;
    this.biomeManager = biomeManager;
    this.environmentTimeManager = EnvironmentTimeManager.getInstance();
    this.seasonManager = SeasonManager.getInstance();

    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.butterflies = [];
    this.dragonflies = [];

    this.initButterflies();
    this.initDragonflies();
  }

  createButterflyMesh(colorHex, accentHex) {
    const root = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      roughness: 0.6,
    });
    const wingMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: accentHex,
      emissiveIntensity: 0.18,
      roughness: 0.35,
      side: THREE.DoubleSide,
    });

    const bodyGeo = new THREE.CapsuleGeometry(0.012, 0.075, 4, 6);
    bodyGeo.rotateX(Math.PI / 2);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    root.add(body);

    const foreWingGeo = new THREE.CircleGeometry(0.068, 7);
    foreWingGeo.scale(1.15, 0.82, 1.0);
    const hindWingGeo = new THREE.CircleGeometry(0.048, 7);

    const leftWingPivot = new THREE.Group();
    const leftFore = new THREE.Mesh(foreWingGeo, wingMat);
    leftFore.rotation.x = -Math.PI / 2;
    leftFore.position.set(0.052, 0, 0.018);
    const leftHind = new THREE.Mesh(hindWingGeo, wingMat);
    leftHind.rotation.x = -Math.PI / 2;
    leftHind.position.set(0.04, 0, -0.025);
    leftWingPivot.add(leftFore, leftHind);
    root.add(leftWingPivot);

    const rightWingPivot = new THREE.Group();
    const rightFore = new THREE.Mesh(foreWingGeo, wingMat);
    rightFore.rotation.x = -Math.PI / 2;
    rightFore.position.set(-0.052, 0, 0.018);
    const rightHind = new THREE.Mesh(hindWingGeo, wingMat);
    rightHind.rotation.x = -Math.PI / 2;
    rightHind.position.set(-0.04, 0, -0.025);
    rightWingPivot.add(rightFore, rightHind);
    root.add(rightWingPivot);

    return {
      root,
      leftWingPivot,
      rightWingPivot,
      materials: [bodyMat, wingMat],
      geometries: [bodyGeo, foreWingGeo, hindWingGeo],
    };
  }

  createDragonflyMesh(bodyColorHex) {
    const root = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({
      color: bodyColorHex,
      roughness: 0.25,
      metalness: 0.45,
    });
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.65,
      roughness: 0.15,
      side: THREE.DoubleSide,
    });

    // Slender iridescent abdomen + thorax
    const abdomenGeo = new THREE.CylinderGeometry(0.008, 0.004, 0.16, 6);
    abdomenGeo.rotateX(Math.PI / 2);
    const abdomen = new THREE.Mesh(abdomenGeo, bodyMat);
    abdomen.position.z = -0.03;
    root.add(abdomen);

    const headGeo = new THREE.SphereGeometry(0.018, 8, 8);
    const head = new THREE.Mesh(headGeo, bodyMat);
    head.position.z = 0.06;
    root.add(head);

    const wingGeo = new THREE.PlaneGeometry(0.16, 0.026);
    wingGeo.rotateX(-Math.PI / 2);

    const leftWingPivot = new THREE.Group();
    const lw1 = new THREE.Mesh(wingGeo, wingMat);
    lw1.position.set(0.08, 0.005, 0.025);
    lw1.rotation.y = 0.12;
    const lw2 = new THREE.Mesh(wingGeo, wingMat);
    lw2.position.set(0.075, 0.003, -0.005);
    lw2.rotation.y = -0.1;
    leftWingPivot.add(lw1, lw2);
    root.add(leftWingPivot);

    const rightWingPivot = new THREE.Group();
    const rw1 = new THREE.Mesh(wingGeo, wingMat);
    rw1.position.set(-0.08, 0.005, 0.025);
    rw1.rotation.y = -0.12;
    const rw2 = new THREE.Mesh(wingGeo, wingMat);
    rw2.position.set(-0.075, 0.003, -0.005);
    rw2.rotation.y = 0.1;
    rightWingPivot.add(rw1, rw2);
    root.add(rightWingPivot);

    return {
      root,
      leftWingPivot,
      rightWingPivot,
      materials: [bodyMat, wingMat],
      geometries: [abdomenGeo, headGeo, wingGeo],
    };
  }

  initButterflies() {
    const palettes = [
      [0xf97316, 0xfbbf24], // Monarch Orange
      [0x38bdf8, 0x0284c7], // Morpho Blue
      [0xfacc15, 0xfef08a], // Swallowtail Yellow
      [0xf472b6, 0xfbcfe8], // Meadow Pink
    ];

    for (let i = 0; i < 10; i++) {
      const [c1, c2] = palettes[i % palettes.length];
      const bf = this.createButterflyMesh(c1, c2);

      // Place near grassy flower patches outside deep water
      const anchor = new THREE.Vector3(
        (Math.random() - 0.5) * 14.0,
        0.55 + Math.random() * 0.65,
        (Math.random() - 0.5) * 14.0
      );
      if (this.biomeManager.getWaterDepth(anchor.x, anchor.z) > 0.25) {
        anchor.x = -5.5 + (Math.random() - 0.5) * 4.0;
        anchor.z = -4.5 + (Math.random() - 0.5) * 4.0;
      }

      bf.root.position.copy(anchor);
      this.group.add(bf.root);

      this.butterflies.push({
        ...bf,
        anchor,
        orbitPhase: Math.random() * Math.PI * 2,
        orbitSpeed: 0.75 + Math.random() * 0.55,
        flapPhase: Math.random() * Math.PI * 2,
        radius: 0.9 + Math.random() * 1.4,
      });
    }
  }

  initDragonflies() {
    const colors = [0x06b6d4, 0x10b981, 0x3b82f6];

    for (let i = 0; i < 6; i++) {
      const df = this.createDragonflyMesh(colors[i % colors.length]);
      const waterPt = this.biomeManager.getRandomWaterPoint(0.45);
      waterPt.y = 0.28 + (i % 3) * 0.08;

      df.root.position.copy(waterPt);
      this.group.add(df.root);

      this.dragonflies.push({
        ...df,
        target: this.biomeManager.getRandomWaterPoint(0.45),
        hoverTimer: 0.8 + Math.random() * 1.8,
        speed: 2.4 + Math.random() * 0.9,
        wingPhase: Math.random() * Math.PI * 2,
      });
    }
  }

  update(delta, elapsedTime) {
    const dt = Math.min(delta, 0.05);
    const isDay = this.environmentTimeManager.envTime === 'day';
    const season = this.seasonManager.currentSeason;
    const active = isDay && (season === 'spring' || season === 'autumn');

    this.group.visible = active;
    if (!active) return;

    // 1. Update fluttering butterflies
    for (let i = 0; i < this.butterflies.length; i++) {
      const bf = this.butterflies[i];
      bf.orbitPhase += dt * bf.orbitSpeed;
      bf.flapPhase += dt * 16.5;

      const prevX = bf.root.position.x;
      const prevZ = bf.root.position.z;

      const nextX =
        bf.anchor.x +
        Math.cos(bf.orbitPhase) * bf.radius +
        Math.sin(elapsedTime * 1.7 + i) * 0.25;
      const nextZ =
        bf.anchor.z +
        Math.sin(bf.orbitPhase * 0.85) * bf.radius +
        Math.cos(elapsedTime * 1.3 + i) * 0.25;
      const nextY =
        bf.anchor.y +
        Math.sin(elapsedTime * 3.4 + i * 1.2) * 0.18 +
        Math.cos(bf.flapPhase * 0.5) * 0.03;

      bf.root.position.set(nextX, nextY, nextZ);
      bf.root.rotation.y = Math.atan2(nextX - prevX, nextZ - prevZ);

      const wingAngle = Math.sin(bf.flapPhase) * 0.95;
      bf.leftWingPivot.rotation.z = wingAngle;
      bf.rightWingPivot.rotation.z = -wingAngle;
    }

    // 2. Update hovering & darting dragonflies over the water
    for (let i = 0; i < this.dragonflies.length; i++) {
      const df = this.dragonflies[i];
      df.wingPhase += dt * 42.0;

      const wingBuzz = Math.sin(df.wingPhase) * 0.45;
      df.leftWingPivot.rotation.z = wingBuzz;
      df.rightWingPivot.rotation.z = -wingBuzz;

      const dx = df.target.x - df.root.position.x;
      const dz = df.target.z - df.root.position.z;
      const dist = Math.hypot(dx, dz);

      if (dist > 0.15) {
        const step = Math.min(dist, df.speed * dt);
        df.root.position.x += (dx / dist) * step;
        df.root.position.z += (dz / dist) * step;
        df.root.rotation.y = Math.atan2(dx, dz);
      } else {
        df.hoverTimer -= dt;
        if (df.hoverTimer <= 0) {
          df.hoverTimer = 1.2 + Math.random() * 2.2;
          df.target.copy(this.biomeManager.getRandomWaterPoint(0.4));
        }
      }

      df.root.position.y =
        0.26 + Math.sin(elapsedTime * 4.5 + i * 2.1) * 0.05;
    }
  }

  dispose() {
    [...this.butterflies, ...this.dragonflies].forEach((item) => {
      item.materials.forEach((m) => m.dispose());
      item.geometries.forEach((g) => g.dispose());
    });
    this.scene.remove(this.group);
  }
}
