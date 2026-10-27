import * as THREE from 'three';
import Game from '../../../Game.class';
import EnvironmentTimeManager from '../../Managers/EnvironmentManager/EnvironmentManager.class';
import SeasonManager from '../../Managers/SeasonManager/SeasonManager.class';

export default class Birds {
  constructor() {
    this.game = Game.getInstance();
    this.scene = this.game.scene;
    this.environmentTimeManager = EnvironmentTimeManager.getInstance();
    this.seasonManager = SeasonManager.getInstance();

    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.soaringBirds = [];
    this.songBirds = [];
    this.chirpNotes = [];

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Natural perches around the bridge, rocks, trees, and camp
    this.perches = [
      new THREE.Vector3(-7.6, 1.68, 1.35), // Bridge rail 1
      new THREE.Vector3(-8.4, 1.65, 1.15), // Bridge rail 2
      new THREE.Vector3(-3.8, 0.85, -3.5), // Camp rock / log
      new THREE.Vector3(4.6, 1.35, -4.2),  // Rock outcrop East
      new THREE.Vector3(-6.2, 2.85, -5.8), // Tree branch West
      new THREE.Vector3(6.8, 3.1, 3.8),    // Tree branch South-East
      new THREE.Vector3(2.4, 0.72, 5.2),   // Shore stone South
      new THREE.Vector3(-2.4, 0.68, -6.2), // North glade boulder
      new THREE.Vector3(5.4, 2.6, -1.5),   // East tree branch
    ];

    this.speciesPalettes = [
      {
        // Bluebird
        body: 0x3b82f6,
        breast: 0xe07a5f,
        wing: 0x1d4ed8,
        beak: 0xf59e0b,
      },
      {
        // Scarlet Cardinal / Robin
        body: 0xdc2626,
        breast: 0xef4444,
        wing: 0x991b1b,
        beak: 0xfbbf24,
      },
      {
        // Goldfinch
        body: 0xfacc15,
        breast: 0xfef08a,
        wing: 0x27272a,
        beak: 0xf97316,
      },
      {
        // Forest Swallow
        body: 0x2dd4bf,
        breast: 0xf8fafc,
        wing: 0x0f766e,
        beak: 0xf59e0b,
      },
    ];

    this.initChirpRingPool();
    this.initSoaringFlock();
    this.initSongBirds();
    this.bindInteraction();
  }

  createBirdMesh(palette, scale = 1.0) {
    const birdRoot = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({
      color: palette.body,
      roughness: 0.6,
    });
    const breastMat = new THREE.MeshStandardMaterial({
      color: palette.breast,
      roughness: 0.65,
    });
    const wingMat = new THREE.MeshStandardMaterial({
      color: palette.wing,
      roughness: 0.55,
      side: THREE.DoubleSide,
    });
    const beakMat = new THREE.MeshStandardMaterial({
      color: palette.beak,
      roughness: 0.4,
    });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });

    // Plump songbird body
    const bodyGeo = new THREE.SphereGeometry(0.11, 12, 10);
    bodyGeo.scale(0.85, 0.82, 1.35);
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.castShadow = true;
    birdRoot.add(bodyMesh);

    // Warm breast patch
    const breastGeo = new THREE.SphereGeometry(0.095, 10, 8);
    breastGeo.scale(0.78, 0.72, 1.1);
    const breastMesh = new THREE.Mesh(breastGeo, breastMat);
    breastMesh.position.set(0, -0.022, 0.032);
    birdRoot.add(breastMesh);

    // Head Pivot (allows head cocking when chirping)
    const headPivot = new THREE.Group();
    headPivot.position.set(0, 0.065, 0.11);
    birdRoot.add(headPivot);

    const headGeo = new THREE.SphereGeometry(0.076, 10, 10);
    const headMesh = new THREE.Mesh(headGeo, bodyMat);
    headMesh.castShadow = true;
    headPivot.add(headMesh);

    // Upper & Lower Beak (opens when chirping)
    const beakGeo = new THREE.ConeGeometry(0.024, 0.075, 6);
    beakGeo.rotateX(Math.PI / 2);
    const upperBeak = new THREE.Mesh(beakGeo, beakMat);
    upperBeak.position.set(0, 0.008, 0.085);
    headPivot.add(upperBeak);

    const lowerBeakGeo = new THREE.ConeGeometry(0.018, 0.06, 6);
    lowerBeakGeo.rotateX(Math.PI / 2);
    const lowerBeak = new THREE.Mesh(lowerBeakGeo, beakMat);
    lowerBeak.position.set(0, -0.008, 0.078);
    headPivot.add(lowerBeak);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.014, 6, 6);
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(0.052, 0.018, 0.042);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(-0.052, 0.018, 0.042);
    headPivot.add(leftEye, rightEye);

    // Tail fan
    const tailGeo = new THREE.ConeGeometry(0.065, 0.18, 5);
    tailGeo.rotateX(-Math.PI / 2);
    tailGeo.scale(0.85, 0.2, 1.0);
    const tailMesh = new THREE.Mesh(tailGeo, wingMat);
    tailMesh.position.set(0, 0.01, -0.18);
    tailMesh.rotation.x = 0.22;
    birdRoot.add(tailMesh);

    // Left & Right Articulated Wings
    const wingGeo = new THREE.BoxGeometry(0.24, 0.018, 0.14);
    const leftWingPivot = new THREE.Group();
    leftWingPivot.position.set(0.075, 0.025, 0.01);
    const leftWing = new THREE.Mesh(wingGeo, wingMat);
    leftWing.position.set(0.11, 0, -0.01);
    leftWing.rotation.y = -0.18;
    leftWing.castShadow = true;
    leftWingPivot.add(leftWing);
    birdRoot.add(leftWingPivot);

    const rightWingPivot = new THREE.Group();
    rightWingPivot.position.set(-0.075, 0.025, 0.01);
    const rightWing = new THREE.Mesh(wingGeo, wingMat);
    rightWing.position.set(-0.11, 0, -0.01);
    rightWing.rotation.y = 0.18;
    rightWing.castShadow = true;
    rightWingPivot.add(rightWing);
    birdRoot.add(rightWingPivot);

    birdRoot.scale.setScalar(scale);

    return {
      root: birdRoot,
      bodyMesh,
      headPivot,
      lowerBeak,
      tailMesh,
      leftWingPivot,
      rightWingPivot,
      materials: [bodyMat, breastMat, wingMat, beakMat, eyeMat],
    };
  }

  initChirpRingPool() {
    this.chirpRingGeo = new THREE.RingGeometry(0.04, 0.068, 20);

    for (let i = 0; i < 12; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xfff3b0,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(this.chirpRingGeo, mat);
      mesh.visible = false;
      this.group.add(mesh);
      this.chirpNotes.push({
        mesh,
        mat,
        active: false,
        age: 0,
        maxAge: 1.15,
        origin: new THREE.Vector3(),
      });
    }
  }

  spawnChirpVisual(worldPos) {
    const ring = this.chirpNotes.find((n) => !n.active);
    if (!ring) return;

    ring.active = true;
    ring.age = 0;
    ring.origin.copy(worldPos);
    ring.origin.y += 0.22;
    ring.mesh.position.copy(ring.origin);
    ring.mesh.scale.setScalar(0.5);
    ring.mat.opacity = 0.85;
    ring.mesh.visible = true;
  }

  triggerBirdChirp(bird, playAudio = true) {
    const isDay = this.environmentTimeManager.envTime === 'day';
    const isRainy = this.seasonManager.currentSeason === 'rainy';
    if (!isDay || isRainy) return;

    bird.chirpAnimTimer = 0.85;
    this.spawnChirpVisual(bird.root.position);

    if (
      playAudio &&
      this.game.ambientSoundManager &&
      typeof this.game.ambientSoundManager.playSpatialBirdChirp === 'function'
    ) {
      this.game.ambientSoundManager.playSpatialBirdChirp(bird.root.position);
    }
  }

  initSoaringFlock() {
    const flockCount = 9;
    for (let i = 0; i < flockCount; i++) {
      const palette =
        this.speciesPalettes[i % this.speciesPalettes.length];
      const bird = this.createBirdMesh(palette, 0.92 + (i % 3) * 0.1);

      const angle = (i / flockCount) * Math.PI * 2;
      const radius = 8.5 + (i % 3) * 3.2;
      const altitude = 6.8 + (i % 4) * 1.35;

      bird.root.position.set(
        Math.cos(angle) * radius,
        altitude,
        Math.sin(angle) * radius
      );
      this.group.add(bird.root);

      this.soaringBirds.push({
        ...bird,
        orbitAngle: angle,
        orbitRadius: radius,
        baseAltitude: altitude,
        orbitSpeed: 0.26 + (i % 3) * 0.05,
        centerOffset: new THREE.Vector2(
          (Math.random() - 0.5) * 4.0,
          (Math.random() - 0.5) * 4.0
        ),
        flapPhase: Math.random() * Math.PI * 2,
        flapSpeed: 10.5 + Math.random() * 2.5,
        glideCycle: Math.random() * 10,
        chirpCooldown: 4.5 + i * 1.8,
        chirpAnimTimer: 0,
      });
    }
  }

  initSongBirds() {
    const count = 6;
    for (let i = 0; i < count; i++) {
      const palette =
        this.speciesPalettes[(i + 1) % this.speciesPalettes.length];
      const bird = this.createBirdMesh(palette, 0.85);

      const perchIdx = i % this.perches.length;
      const startPerch = this.perches[perchIdx];
      bird.root.position.copy(startPerch);

      this.group.add(bird.root);

      this.songBirds.push({
        ...bird,
        state: 'perched', // 'perched' | 'flying'
        perchIndex: perchIdx,
        startPos: startPerch.clone(),
        targetPos: startPerch.clone(),
        flightProgress: 0,
        flightDuration: 2.2,
        stateTimer: 2.5 + i * 1.6,
        chirpTimer: 1.8 + i * 1.3,
        chirpAnimTimer: 0,
        flapPhase: Math.random() * Math.PI * 2,
        hopPhase: 0,
        facingAngle: Math.random() * Math.PI * 2,
      });
    }
  }

  flyToNewPerch(bird, playChirp = false) {
    let nextIdx = Math.floor(Math.random() * this.perches.length);
    if (nextIdx === bird.perchIndex) {
      nextIdx = (nextIdx + 1) % this.perches.length;
    }

    bird.perchIndex = nextIdx;
    bird.startPos.copy(bird.root.position);
    bird.targetPos.copy(this.perches[nextIdx]);
    // Slight natural offset on the perch
    bird.targetPos.x += (Math.random() - 0.5) * 0.35;
    bird.targetPos.z += (Math.random() - 0.5) * 0.35;

    const dist = bird.startPos.distanceTo(bird.targetPos);
    bird.flightDuration = Math.max(1.4, Math.min(3.4, dist * 0.24));
    bird.flightProgress = 0;
    bird.state = 'flying';

    if (playChirp) {
      this.triggerBirdChirp(bird, true);
    }
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


      const rect =
        this.game.renderer.rendererInstance.domElement.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(
        this.mouse,
        this.game.camera.cameraInstance
      );

      const allBirdRoots = [
        ...this.songBirds.map((b) => b.root),
        ...this.soaringBirds.map((b) => b.root),
      ];
      const intersects = this.raycaster.intersectObjects(allBirdRoots, true);

      if (intersects.length > 0) {
        const hitObj = intersects[0].object;
        const hitSongBird = this.songBirds.find((b) => {
          let curr = hitObj;
          while (curr) {
            if (curr === b.root) return true;
            curr = curr.parent;
          }
          return false;
        });

        if (hitSongBird) {
          this.flyToNewPerch(hitSongBird, true);
          return;
        }

        const hitSoaring = this.soaringBirds.find((b) => {
          let curr = hitObj;
          while (curr) {
            if (curr === b.root) return true;
            curr = curr.parent;
          }
          return false;
        });

        if (hitSoaring) {
          this.triggerBirdChirp(hitSoaring, true);
        }
      }
    };

    window.addEventListener('pointerdown', this.onPointerDown);
  }

  update(delta, elapsedTime) {
    const dt = Math.min(delta, 0.05);
    const isDay = this.environmentTimeManager.envTime === 'day';
    const isRainy = this.seasonManager.currentSeason === 'rainy';
    const birdsActive = isDay && !isRainy;

    this.group.visible = birdsActive;
    if (!birdsActive) return;

    // 1. Update high-flying & mid-altitude soaring flock
    for (let i = 0; i < this.soaringBirds.length; i++) {
      const b = this.soaringBirds[i];

      b.orbitAngle += dt * b.orbitSpeed;
      b.glideCycle += dt;

      const radiusWave = Math.sin(elapsedTime * 0.45 + i) * 1.8;
      const r = b.orbitRadius + radiusWave;

      const nextX =
        b.centerOffset.x + Math.cos(b.orbitAngle) * r;
      const nextZ =
        b.centerOffset.y + Math.sin(b.orbitAngle) * (r * 0.82);
      const nextY =
        b.baseAltitude + Math.sin(elapsedTime * 1.1 + i * 1.4) * 0.65;

      const dx = nextX - b.root.position.x;
      const dy = nextY - b.root.position.y;
      const dz = nextZ - b.root.position.z;

      b.root.position.set(nextX, nextY, nextZ);

      const heading = Math.atan2(dx, dz);
      b.root.rotation.y = heading;
      b.root.rotation.x = THREE.MathUtils.clamp(-dy * 2.2, -0.35, 0.35);
      // Bank into the turn
      b.root.rotation.z = -0.24 - Math.cos(elapsedTime * 0.6 + i) * 0.1;

      // Alternate between active wing flapping and graceful gliding
      const isGliding = Math.sin(b.glideCycle * 1.4 + i) > 0.35;
      if (isGliding) {
        const glideAngle = Math.sin(elapsedTime * 2.5 + i) * 0.08 + 0.12;
        b.leftWingPivot.rotation.z = glideAngle;
        b.rightWingPivot.rotation.z = -glideAngle;
      } else {
        b.flapPhase += dt * b.flapSpeed;
        const wingAngle = Math.sin(b.flapPhase) * 0.68;
        b.leftWingPivot.rotation.z = wingAngle;
        b.rightWingPivot.rotation.z = -wingAngle;
      }

      // Occasional overhead call
      b.chirpCooldown -= dt;
      if (b.chirpCooldown <= 0) {
        b.chirpCooldown = 11.0 + Math.random() * 14.0;
        this.triggerBirdChirp(b, i % 2 === 0);
      }
    }

    // 2. Update low-flying & perching songbirds
    for (let i = 0; i < this.songBirds.length; i++) {
      const sb = this.songBirds[i];

      if (sb.state === 'perched') {
        sb.stateTimer -= dt;
        sb.chirpTimer -= dt;

        // Fold wings neatly against body while perched
        sb.leftWingPivot.rotation.z = THREE.MathUtils.lerp(
          sb.leftWingPivot.rotation.z,
          -0.95,
          dt * 10
        );
        sb.rightWingPivot.rotation.z = THREE.MathUtils.lerp(
          sb.rightWingPivot.rotation.z,
          0.95,
          dt * 10
        );
        sb.root.rotation.x = THREE.MathUtils.lerp(sb.root.rotation.x, 0, dt * 8);
        sb.root.rotation.z = THREE.MathUtils.lerp(sb.root.rotation.z, 0, dt * 8);

        // Periodic cheerful chirping with beak movement, head cocking & hop
        if (sb.chirpTimer <= 0) {
          sb.chirpTimer = 3.2 + Math.random() * 4.8;
          this.triggerBirdChirp(sb, true);
        }

        if (sb.chirpAnimTimer > 0) {
          sb.chirpAnimTimer -= dt;
          const chirpWave = Math.abs(Math.sin(elapsedTime * 28.0));
          sb.lowerBeak.rotation.x = chirpWave * 0.42;
          sb.headPivot.rotation.z = Math.sin(elapsedTime * 14.0 + i) * 0.22;
          sb.headPivot.rotation.x = -0.15 * chirpWave;
          sb.tailMesh.rotation.x = 0.22 + chirpWave * 0.25;
          // Little excited hop on the perch
          sb.root.position.y =
            sb.targetPos.y + Math.abs(Math.sin(sb.chirpAnimTimer * 12.0)) * 0.06;
          // Slight wing flutter during song
          sb.leftWingPivot.rotation.z = -0.65 + chirpWave * 0.35;
          sb.rightWingPivot.rotation.z = 0.65 - chirpWave * 0.35;
        } else {
          sb.lowerBeak.rotation.x = 0;
          sb.headPivot.rotation.z = Math.sin(elapsedTime * 1.8 + i) * 0.08;
          sb.headPivot.rotation.x = 0;
          sb.root.position.y = sb.targetPos.y;
        }

        if (sb.stateTimer <= 0) {
          sb.stateTimer = 5.5 + Math.random() * 6.5;
          this.flyToNewPerch(sb, Math.random() > 0.45);
        }
      } else if (sb.state === 'flying') {
        sb.flightProgress += dt / sb.flightDuration;

        if (sb.flightProgress >= 1.0) {
          sb.root.position.copy(sb.targetPos);
          sb.state = 'perched';
          sb.stateTimer = 4.5 + Math.random() * 6.0;
          sb.chirpTimer = 0.6 + Math.random() * 1.4;
        } else {
          const t = sb.flightProgress;
          const prevPos = sb.root.position.clone();

          sb.root.position.lerpVectors(sb.startPos, sb.targetPos, t);
          // Graceful parabolic flight arc
          const arcHeight =
            Math.sin(t * Math.PI) *
            (1.4 + sb.startPos.distanceTo(sb.targetPos) * 0.18);
          sb.root.position.y += arcHeight;

          const moveDir = sb.root.position.clone().sub(prevPos);
          if (moveDir.lengthSq() > 0.00001) {
            sb.facingAngle = Math.atan2(moveDir.x, moveDir.z);
          }

          sb.root.rotation.y = sb.facingAngle;
          sb.root.rotation.x = THREE.MathUtils.clamp(
            -moveDir.y * 6.0,
            -0.45,
            0.45
          );

          sb.flapPhase += dt * 18.0;
          const flap = Math.sin(sb.flapPhase) * 0.78;
          sb.leftWingPivot.rotation.z = flap;
          sb.rightWingPivot.rotation.z = -flap;
        }
      }
    }

    // 3. Animate rising acoustic chirp rings (billboarded toward camera)
    const camQuat = this.game.camera.cameraInstance.quaternion;
    for (let i = 0; i < this.chirpNotes.length; i++) {
      const note = this.chirpNotes[i];
      if (!note.active) continue;

      note.age += dt;
      const p = note.age / note.maxAge;
      if (p >= 1.0) {
        note.active = false;
        note.mesh.visible = false;
      } else {
        note.mesh.position.y = note.origin.y + p * 0.45;
        note.mesh.quaternion.copy(camQuat);
        note.mesh.scale.setScalar(0.55 + p * 2.1);
        note.mat.opacity = (1.0 - p) * 0.75;
      }
    }
  }

  dispose() {
    window.removeEventListener('pointerdown', this.onPointerDown);
    if (this.chirpRingGeo) this.chirpRingGeo.dispose();
    this.chirpNotes.forEach((n) => n.mat.dispose());
    [...this.soaringBirds, ...this.songBirds].forEach((b) => {
      b.materials.forEach((m) => m.dispose());
    });
    this.scene.remove(this.group);
  }
}
