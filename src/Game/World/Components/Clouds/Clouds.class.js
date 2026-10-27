import * as THREE from 'three';
import Game from '../../../Game.class';
import EnvironmentTimeManager from '../../Managers/EnvironmentManager/EnvironmentManager.class';
import SeasonManager from '../../Managers/SeasonManager/SeasonManager.class';

export default class Clouds {
  constructor() {
    this.game = Game.getInstance();
    this.scene = this.game.scene;
    this.environmentTimeManager = EnvironmentTimeManager.getInstance();
    this.seasonManager = SeasonManager.getInstance();
    this.envTime = this.environmentTimeManager.envTime;
    this.currentSeason = this.seasonManager.currentSeason;

    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.clouds = [];
    this.cloudCount = 9;
    this.driftRange = 22.0;

    this.cloudMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.92,
      metalness: 0.0,
      transparent: true,
      opacity: 0.88,
      flatShading: false,
    });

    this.puffGeometry = new THREE.IcosahedronGeometry(1.0, 3);

    this.initClouds();
    this.updateCloudAppearance();

    this.environmentTimeManager.onChange((newValue) => {
      this.envTime = newValue;
      this.updateCloudAppearance();
    });

    this.seasonManager.onChange((newSeason) => {
      this.currentSeason = newSeason;
      this.updateCloudAppearance();
    });
  }

  createCloudCluster(index) {
    const cluster = new THREE.Group();
    const puffs = [];

    const puffSpecs = [
      { pos: [0, 0.18, 0], scale: [1.55, 0.82, 1.15] },
      { pos: [-1.15, 0.02, 0.18], scale: [1.18, 0.68, 0.95] },
      { pos: [1.2, 0.05, -0.14], scale: [1.25, 0.72, 1.0] },
      { pos: [-0.48, 0.38, -0.25], scale: [1.1, 0.75, 0.88] },
      { pos: [0.55, 0.34, 0.28], scale: [1.05, 0.7, 0.9] },
      { pos: [-1.85, -0.12, -0.1], scale: [0.82, 0.5, 0.72] },
      { pos: [1.9, -0.1, 0.15], scale: [0.85, 0.52, 0.75] },
    ];

    puffSpecs.forEach((spec, pIdx) => {
      const mesh = new THREE.Mesh(this.puffGeometry, this.cloudMaterial);
      const jitterX = (Math.random() - 0.5) * 0.22;
      const jitterZ = (Math.random() - 0.5) * 0.22;

      mesh.position.set(
        spec.pos[0] + jitterX,
        spec.pos[1],
        spec.pos[2] + jitterZ
      );
      mesh.scale.set(
        spec.scale[0] * (0.9 + Math.random() * 0.2),
        spec.scale[1] * (0.9 + Math.random() * 0.2),
        spec.scale[2] * (0.9 + Math.random() * 0.2)
      );

      // Cast soft cloud shadows onto the terrain and lake below
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      cluster.add(mesh);
      puffs.push({
        mesh,
        baseScaleY: mesh.scale.y,
        baseY: mesh.position.y,
        phaseOffset: pIdx * 0.9 + index * 1.3,
      });
    });

    const overallScale = 0.72 + (index % 3) * 0.22;
    cluster.scale.setScalar(overallScale);

    return { cluster, puffs, baseScale: overallScale };
  }

  initClouds() {
    for (let i = 0; i < this.cloudCount; i++) {
      const { cluster, puffs, baseScale } = this.createCloudCluster(i);

      // Spread evenly across the sky dome and key light shadow frustum
      const laneZ = -13.0 + (i / (this.cloudCount - 1)) * 24.0;
      const startX =
        -this.driftRange +
        ((i * 7.3) % (this.driftRange * 2));
      const altitude = 9.2 + (i % 3) * 1.45;

      cluster.position.set(startX, altitude, laneZ);
      cluster.rotation.y = (Math.random() - 0.5) * 0.45;

      this.group.add(cluster);

      this.clouds.push({
        cluster,
        puffs,
        baseScale,
        baseAltitude: altitude,
        speed: 0.34 + (i % 4) * 0.08,
        bobPhase: Math.random() * Math.PI * 2,
      });
    }
  }

  updateCloudAppearance() {
    const isDay = this.envTime === 'day';
    const season = this.currentSeason;

    if (season === 'rainy') {
      this.cloudMaterial.color.setHex(isDay ? 0x8d9aa6 : 0x3b4754);
      this.cloudMaterial.emissive.setHex(isDay ? 0x2c353d : 0x121820);
      this.cloudMaterial.emissiveIntensity = 0.35;
      this.cloudMaterial.opacity = 0.94;
    } else if (season === 'autumn') {
      this.cloudMaterial.color.setHex(isDay ? 0xfff6ed : 0x526478);
      this.cloudMaterial.emissive.setHex(isDay ? 0xffe4cc : 0x1e293b);
      this.cloudMaterial.emissiveIntensity = isDay ? 0.25 : 0.3;
      this.cloudMaterial.opacity = 0.88;
    } else if (season === 'winter') {
      this.cloudMaterial.color.setHex(isDay ? 0xf1f5f9 : 0x5b6e84);
      this.cloudMaterial.emissive.setHex(isDay ? 0xdbeafe : 0x1e293b);
      this.cloudMaterial.emissiveIntensity = 0.28;
      this.cloudMaterial.opacity = 0.9;
    } else {
      // Spring
      this.cloudMaterial.color.setHex(isDay ? 0xffffff : 0x586b82);
      this.cloudMaterial.emissive.setHex(isDay ? 0xf8fafc : 0x1e293b);
      this.cloudMaterial.emissiveIntensity = isDay ? 0.22 : 0.3;
      this.cloudMaterial.opacity = 0.88;
    }

    const seasonScaleMult = season === 'rainy' ? 1.25 : 1.0;
    this.clouds.forEach((c) => {
      c.cluster.scale.setScalar(c.baseScale * seasonScaleMult);
    });
  }

  update(delta, elapsedTime) {
    const dt = Math.min(delta, 0.05);
    const windSpeedMult =
      this.currentSeason === 'rainy'
        ? 1.85
        : this.currentSeason === 'autumn'
        ? 1.25
        : 1.0;

    for (let i = 0; i < this.clouds.length; i++) {
      const c = this.clouds[i];

      // Smoothly drift across the sky
      c.cluster.position.x += c.speed * windSpeedMult * dt;
      if (c.cluster.position.x > this.driftRange) {
        c.cluster.position.x = -this.driftRange;
      }

      // Gentle vertical float
      c.cluster.position.y =
        c.baseAltitude + Math.sin(elapsedTime * 0.45 + c.bobPhase) * 0.18;

      // Subtle billow breathing of cloud puffs
      for (let j = 0; j < c.puffs.length; j++) {
        const p = c.puffs[j];
        const breath = Math.sin(elapsedTime * 0.9 + p.phaseOffset) * 0.045;
        p.mesh.scale.y = p.baseScaleY * (1.0 + breath);
        p.mesh.position.y = p.baseY + breath * 0.15;
      }
    }
  }

  dispose() {
    if (this.puffGeometry) this.puffGeometry.dispose();
    if (this.cloudMaterial) this.cloudMaterial.dispose();
    this.scene.remove(this.group);
  }
}
