import React, { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  Brain,
  RotateCcw,
  Eye,
  Sliders,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
  Info,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Compass,
  Play,
  Pause,
  Zap,
} from "lucide-react";

export default function ThreeBrainViewer({
  predictedClass = "MildDemented",
  confidence = 0.85,
  peakCoordinates = null,
  regionImportance = null,
  riskLevel = "HIGH",
}) {
  const mountRef = useRef(null);
  const controlsRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const animFrameIdRef = useRef(null);

  // Group references
  const masterGroupRef = useRef(null);
  const particlesGroupRef = useRef(null);
  const fibersGroupRef = useRef(null);
  const defectGroupRef = useRef(null);
  const orbitsGroupRef = useRef(null);

  // Dynamic state
  const [activePreset, setActivePreset] = useState("isometric");
  const [showFibers, setShowFibers] = useState(true);
  const [showParticles, setShowParticles] = useState(true);
  const [showDefectCore, setShowDefectCore] = useState(true);
  const [showOrbits, setShowOrbits] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [glowIntensity, setGlowIntensity] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedCallout, setSelectedCallout] = useState("pathology");

  // Calculate 3D Defect Coordinate dynamically from real-time Grad-CAM peak
  const defect3DPosition = useMemo(() => {
    // 2D Peak coordinate (nx, ny) from Grad-CAM in [0, 1]
    let nx = 0.65;
    let ny = 0.55;

    if (peakCoordinates && typeof peakCoordinates.x === "number") {
      nx = peakCoordinates.x;
      ny = peakCoordinates.y;
    }

    // Map to anatomical 3D brain dimensions:
    // X: Lateral axis (Left +X, Right -X)
    // Y: Superior/Inferior axis (+Y superior, -Y inferior/temporal)
    // Z: Anterior/Posterior axis (+Z anterior/frontal, -Z posterior/occipital)
    const x3d = (nx - 0.5) * 2.8;
    const z3d = -(ny - 0.5) * 3.0; // Inverted so anterior is forward
    // Temporal lobe drops down laterally:
    const y3d = -0.25 + (1.0 - Math.abs(nx - 0.5) * 2.0) * 0.4;

    return new THREE.Vector3(x3d, y3d, z3d);
  }, [peakCoordinates]);

  // Determine pathology metadata
  const defectMetadata = useMemo(() => {
    const isNormal = predictedClass === "NonDemented";
    const isVeryMild = predictedClass === "VeryMildDemented";
    const isMild = predictedClass === "MildDemented";
    const isModerate = predictedClass === "ModerateDemented";

    let regionName = "Left Medial Temporal Lobe & Hippocampus";
    if (defect3DPosition.x < -0.3) {
      regionName = "Right Medial Temporal Lobe & Hippocampus";
    } else if (defect3DPosition.x > 0.3) {
      regionName = "Left Medial Temporal Lobe & Hippocampus";
    } else if (defect3DPosition.z > 0.4) {
      regionName = "Prefrontal Cortex & Anterior Cingulate";
    } else if (defect3DPosition.z < -0.4) {
      regionName = "Posterior Cingulate & Precuneus";
    }

    let saliencyPct = 88.4;
    if (regionImportance && Array.isArray(regionImportance) && regionImportance.length > 0) {
      saliencyPct = regionImportance[0].percentage || regionImportance[0].importance * 100 || 88.4;
    }

    return {
      regionName,
      saliencyPct: Number(saliencyPct).toFixed(1),
      isNormal,
      severity: isModerate ? "Severe" : isMild ? "Moderate" : isVeryMild ? "Early Stage" : "Intact",
    };
  }, [defect3DPosition, predictedClass, regionImportance]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Deep Midnight Space Background (matches reference image)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712);
    scene.fog = new THREE.FogExp2(0x030712, 0.04);
    sceneRef.current = scene;

    // 2. Camera setup
    const width = container.clientWidth;
    const height = container.clientHeight;
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(4.2, 2.0, 5.0);
    cameraRef.current = camera;

    // 3. Renderer with high dynamic range tone mapping
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 12;
    controls.minDistance = 2.0;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // 5. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x0a192f, 1.2);
    scene.add(ambientLight);

    const cyanKeyLight = new THREE.DirectionalLight(0x00f0ff, 2.5);
    cyanKeyLight.position.set(5, 6, 4);
    scene.add(cyanKeyLight);

    const blueFillLight = new THREE.DirectionalLight(0x0066ff, 2.0);
    blueFillLight.position.set(-6, -2, -4);
    scene.add(blueFillLight);

    const purpleRimLight = new THREE.DirectionalLight(0x8a2be2, 1.5);
    purpleRimLight.position.set(0, 8, -6);
    scene.add(purpleRimLight);

    // Master Group for All Brain Elements
    const masterBrain = new THREE.Group();
    scene.add(masterBrain);
    masterGroupRef.current = masterBrain;

    // -------------------------------------------------------------------------
    // ANATOMICAL BRAIN SHAPING FUNCTION
    // Generates realistic human brain contour (Cerebrum, Temporal, Cerebellum, Stem)
    // -------------------------------------------------------------------------
    function sampleBrainAnatomy(u, v, isLeft, part = "cerebrum") {
      // u: longitudinal angle [0, PI]
      // v: latitudinal angle [0, PI]
      const phi = v; // 0 (top) to PI (bottom)
      const theta = u; // 0 to PI

      let r = 1.5;
      let x = r * Math.sin(phi) * Math.sin(theta);
      let y = r * Math.cos(phi);
      let z = r * Math.sin(phi) * Math.cos(theta);

      if (part === "cerebrum") {
        // Anatomical Ellipsoid
        z *= 1.35; // elongated anterior-posterior
        y *= 0.95; // slightly flattened superior-inferior
        x *= 0.88; // lateral proportion

        // Medial Sagittal Fissure (separate Left & Right hemispheres)
        const medialSign = isLeft ? 1 : -1;
        x = Math.abs(x) * 0.95 * medialSign;
        x += medialSign * 0.08; // gap between hemispheres

        // Frontal Pole (tapers smoothly anteriorly)
        if (z > 0.4) {
          y += Math.sin(z * 1.5) * 0.15;
          x *= 1.0 - z * 0.12;
        }

        // Temporal Lobe Protrusion (arches downward & laterally on ventral side)
        if (y < 0.1 && Math.abs(z) < 0.8) {
          const tempWeight = Math.max(0, 1.0 - Math.hypot(y + 0.3, z - 0.1));
          x += medialSign * tempWeight * 0.45;
          y -= tempWeight * 0.35;
        }

        // Occipital Lobe (posterior rounding)
        if (z < -0.4) {
          y -= Math.abs(z) * 0.08;
        }

        // Cortical Sulci & Gyri Convolutions (characteristic brain folds)
        const g1 = Math.sin(x * 6.0) * Math.cos(y * 7.0) * Math.sin(z * 6.5) * 0.07;
        const g2 = Math.sin(x * 12.0 + z * 8.0) * Math.cos(y * 11.0) * 0.035;
        const g3 = Math.sin(z * 14.0) * Math.cos(x * 10.0) * 0.02;
        const gyriOffset = g1 + g2 + g3;

        const pos = new THREE.Vector3(x, y, z);
        pos.addScaledVector(pos.clone().normalize(), gyriOffset);
        return pos;
      }

      if (part === "cerebellum") {
        // Cerebellar lobes at the lower posterior
        const medialSign = isLeft ? 1 : -1;
        r = 0.65;
        let cx = (r * Math.sin(phi) * Math.sin(theta)) * 0.85 + (medialSign * 0.32);
        let cy = (r * Math.cos(phi)) * 0.65 - 0.85;
        let cz = (r * Math.sin(phi) * Math.cos(theta)) * 0.75 - 0.85;
        // Horizontal folia ripples
        cy += Math.sin(cy * 25.0) * 0.015;
        return new THREE.Vector3(cx, cy, cz);
      }

      if (part === "brainstem") {
        // Brainstem extending downwards from the base
        r = 0.32;
        let sx = r * Math.sin(phi) * Math.sin(theta) * 0.55;
        let sy = -0.7 - v * 0.55;
        let sz = -0.2 + r * Math.sin(phi) * Math.cos(theta) * 0.65;
        return new THREE.Vector3(sx, sy, sz);
      }

      return new THREE.Vector3(x, y, z);
    }

    // -------------------------------------------------------------------------
    // 6. BUILD GLOWING NEURAL POINT CLOUD & CONNECTOME
    // -------------------------------------------------------------------------
    const particlesGroup = new THREE.Group();
    masterBrain.add(particlesGroup);
    particlesGroupRef.current = particlesGroup;

    const brainNodes = [];
    const particlePositions = [];
    const particleColors = [];
    const particleSizes = [];

    // Color Palettes
    const normalCyan = new THREE.Color(0x00f0ff);
    const deepBlue = new THREE.Color(0x0072ff);
    const glowTeal = new THREE.Color(0x38bdf8);
    const defectAmber = new THREE.Color(0xffa500); // Amber
    const defectFire = new THREE.Color(0xff4500);  // Fiery orange/red
    const defectGold = new THREE.Color(0xffe066);  // Gold peak

    const defectPos = defect3DPosition;
    const defectRadius = 1.15; // Radius of pathological involvement

    function addNode(vec, isSurface = true) {
      brainNodes.push(vec);
      particlePositions.push(vec.x, vec.y, vec.z);

      // Distance to real-time Grad-CAM defect center
      const distToDefect = vec.distanceTo(defectPos);

      if (distToDefect < defectRadius && predictedClass !== "NonDemented") {
        // Defect particle color: fiery radiant gradient
        const t = Math.max(0, 1.0 - distToDefect / defectRadius);
        const col = new THREE.Color().copy(defectAmber).lerp(defectFire, t);
        if (distToDefect < 0.4) col.lerp(defectGold, 0.7);
        particleColors.push(col.r, col.g, col.b);
        particleSizes.push(isSurface ? 3.8 + t * 4.2 : 2.5 + t * 3.0);
      } else {
        // Healthy cortical neural color: cyan to deep electric blue
        const t = (vec.y + 1.5) / 3.0;
        const col = new THREE.Color().copy(deepBlue).lerp(normalCyan, t);
        if (Math.random() > 0.85) col.lerp(glowTeal, 0.6);
        particleColors.push(col.r, col.g, col.b);
        particleSizes.push(isSurface ? 2.4 : 1.6);
      }
    }

    // 6.1 Sample Cerebrum (Left & Right)
    const cerebrumStepsU = 38;
    const cerebrumStepsV = 32;
    [true, false].forEach((isLeft) => {
      for (let i = 0; i < cerebrumStepsU; i++) {
        for (let j = 0; j < cerebrumStepsV; j++) {
          const u = (i / cerebrumStepsU) * Math.PI;
          const v = (j / cerebrumStepsV) * Math.PI;
          const p = sampleBrainAnatomy(u, v, isLeft, "cerebrum");
          addNode(p, true);

          // Deep internal brain parenchyma nodes
          if (Math.random() > 0.45) {
            const inner = p.clone().multiplyScalar(0.55 + Math.random() * 0.35);
            addNode(inner, false);
          }
        }
      }
    });

    // 6.2 Sample Cerebellum
    [true, false].forEach((isLeft) => {
      for (let i = 0; i < 16; i++) {
        for (let j = 0; j < 14; j++) {
          const u = (i / 16) * Math.PI;
          const v = (j / 14) * Math.PI;
          const p = sampleBrainAnatomy(u, v, isLeft, "cerebellum");
          addNode(p, true);
        }
      }
    });

    // 6.3 Sample Brainstem
    for (let i = 0; i < 14; i++) {
      for (let j = 0; j < 12; j++) {
        const u = (i / 14) * Math.PI;
        const v = (j / 12) * Math.PI;
        const p = sampleBrainAnatomy(u, v, true, "brainstem");
        addNode(p, true);
      }
    }

    // Particle Geometry & Texture
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.Float32BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute("color", new THREE.Float32BufferAttribute(particleColors, 3));
    particleGeo.setAttribute("size", new THREE.Float32BufferAttribute(particleSizes, 1));

    // Custom Glowing Particle Canvas Sprite
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255, 255, 255, 1)");
    grad.addColorStop(0.3, "rgba(0, 240, 255, 0.8)");
    grad.addColorStop(0.7, "rgba(0, 114, 255, 0.3)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const particleTexture = new THREE.CanvasTexture(canvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particlesMesh = new THREE.Points(particleGeo, particleMat);
    particlesGroup.add(particlesMesh);

    // -------------------------------------------------------------------------
    // 7. BUILD SYNAPTIC CONNECTOME FIBER LINES (Neural Tractography)
    // -------------------------------------------------------------------------
    const fibersGroup = new THREE.Group();
    masterBrain.add(fibersGroup);
    fibersGroupRef.current = fibersGroup;

    const fiberLinePositions = [];
    const fiberLineColors = [];
    const maxConnectionDist = 0.32;

    // Connect neighboring nodes
    for (let i = 0; i < brainNodes.length; i += 2) {
      const n1 = brainNodes[i];
      let connections = 0;
      for (let j = i + 1; j < brainNodes.length; j += 3) {
        if (connections >= 3) break;
        const n2 = brainNodes[j];
        const d = n1.distanceTo(n2);
        if (d < maxConnectionDist) {
          fiberLinePositions.push(n1.x, n1.y, n1.z);
          fiberLinePositions.push(n2.x, n2.y, n2.z);

          // Color fibers: amber/gold near defect, cyan/blue elsewhere
          const dToDefect = Math.min(n1.distanceTo(defectPos), n2.distanceTo(defectPos));
          if (dToDefect < defectRadius && predictedClass !== "NonDemented") {
            const t = 1.0 - dToDefect / defectRadius;
            const c = new THREE.Color().copy(defectAmber).lerp(defectGold, t);
            fiberLineColors.push(c.r, c.g, c.b, c.r, c.g, c.b);
          } else {
            fiberLineColors.push(0.0, 0.45, 0.85, 0.0, 0.85, 0.95);
          }
          connections++;
        }
      }
    }

    const fiberGeo = new THREE.BufferGeometry();
    fiberGeo.setAttribute("position", new THREE.Float32BufferAttribute(fiberLinePositions, 3));
    fiberGeo.setAttribute("color", new THREE.Float32BufferAttribute(fiberLineColors, 3));

    const fiberMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const fiberLines = new THREE.LineSegments(fiberGeo, fiberMat);
    fibersGroup.add(fiberLines);

    // -------------------------------------------------------------------------
    // 8. REAL-TIME DEFECTED AREA: RADIANT GOLDEN/AMBER STARBURST NEXUS
    // -------------------------------------------------------------------------
    const defectGroup = new THREE.Group();
    masterBrain.add(defectGroup);
    defectGroupRef.current = defectGroup;

    if (predictedClass !== "NonDemented") {
      // 8.1 Inner Intense Core
      const coreGeo = new THREE.SphereGeometry(0.18, 24, 24);
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0xffe066, // Brilliant gold
        transparent: true,
        opacity: 0.95,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.position.copy(defectPos);
      defectGroup.add(coreMesh);

      // 8.2 Concentric Outer Fiery Halo
      const haloGeo = new THREE.SphereGeometry(0.48, 24, 24);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0xff5500, // Fiery amber
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      haloMesh.position.copy(defectPos);
      defectGroup.add(haloMesh);

      // 8.3 Radiating Synaptic Spikes / Starburst Rays
      const rayGeo = new THREE.BufferGeometry();
      const rayPos = [];
      const rayCols = [];
      const numRays = 36;
      for (let r = 0; r < numRays; r++) {
        const dir = new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        ).normalize();
        const rayLen = 0.4 + Math.random() * 0.7;
        const endPos = defectPos.clone().addScaledVector(dir, rayLen);

        rayPos.push(defectPos.x, defectPos.y, defectPos.z);
        rayPos.push(endPos.x, endPos.y, endPos.z);

        rayCols.push(1.0, 0.9, 0.4);
        rayCols.push(1.0, 0.3, 0.0);
      }
      rayGeo.setAttribute("position", new THREE.Float32BufferAttribute(rayPos, 3));
      rayGeo.setAttribute("color", new THREE.Float32BufferAttribute(rayCols, 3));
      const rayMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
      });
      const rays = new THREE.LineSegments(rayGeo, rayMat);
      defectGroup.add(rays);

      // 8.4 Sonar Shockwave Rings
      const ringGeo = new THREE.RingGeometry(0.2, 0.25, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xffaa00,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
      });
      const shockwaveRing = new THREE.Mesh(ringGeo, ringMat);
      shockwaveRing.position.copy(defectPos);
      shockwaveRing.lookAt(camera.position);
      defectGroup.add(shockwaveRing);

      // Dynamic Defect Point Light
      const defectLight = new THREE.PointLight(0xffa500, 3.5, 4.0);
      defectLight.position.copy(defectPos);
      defectGroup.add(defectLight);
    }

    // -------------------------------------------------------------------------
    // 9. ETHEREAL CELESTIAL ORBITAL DATA RINGS (Telemetry Halos)
    // -------------------------------------------------------------------------
    const orbitsGroup = new THREE.Group();
    masterBrain.add(orbitsGroup);
    orbitsGroupRef.current = orbitsGroup;

    // Ring 1: Equatorial Latitude Ring
    const orbit1Geo = new THREE.RingGeometry(2.35, 2.38, 64);
    const orbit1Mat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    });
    const orbit1 = new THREE.Mesh(orbit1Geo, orbit1Mat);
    orbit1.rotation.x = Math.PI / 2;
    orbitsGroup.add(orbit1);

    // Ring 2: Tilted Polar Telemetry Ring
    const orbit2Geo = new THREE.RingGeometry(2.65, 2.68, 64);
    const orbit2Mat = new THREE.MeshBasicMaterial({
      color: 0x0072ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
    });
    const orbit2 = new THREE.Mesh(orbit2Geo, orbit2Mat);
    orbit2.rotation.x = Math.PI / 3;
    orbit2.rotation.y = Math.PI / 4;
    orbitsGroup.add(orbit2);

    // Satellite Data Nodes on Orbits
    const satGeo = new THREE.SphereGeometry(0.04, 12, 12);
    const satMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    for (let s = 0; s < 6; s++) {
      const angle = (s / 6) * Math.PI * 2;
      const sat = new THREE.Mesh(satGeo, satMat);
      sat.position.set(Math.cos(angle) * 2.36, 0, Math.sin(angle) * 2.36);
      orbit1.add(sat);
    }

    // -------------------------------------------------------------------------
    // 10. ANIMATION RENDER LOOP
    // -------------------------------------------------------------------------
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle continuous 360-degree rotation
      if (autoRotate && masterBrain) {
        masterBrain.rotation.y += 0.0035;
      }

      // Orbital telemetry rotation
      if (orbitsGroup) {
        orbitsGroup.rotation.y -= 0.002;
        orbitsGroup.rotation.z += 0.001;
      }

      // Defect Starburst Pulsing & Shockwave Expansion
      if (defectGroup && defectGroup.children.length > 0) {
        const pulse = 1.0 + Math.sin(elapsedTime * 4.5) * 0.15;
        const shockwave = (elapsedTime * 1.2) % 1.5;

        // Pulse core
        const core = defectGroup.children[0];
        if (core) core.scale.set(pulse, pulse, pulse);

        // Expand shockwave ring
        const ring = defectGroup.children[3];
        if (ring) {
          const ringScale = 1.0 + shockwave * 2.2;
          ring.scale.set(ringScale, ringScale, ringScale);
          ring.material.opacity = Math.max(0, 0.7 - shockwave * 0.5);
          ring.lookAt(camera.position);
        }
      }

      // Connectome Fibers Breathing Opacity
      if (fibersGroup && fiberLines) {
        fiberLines.material.opacity = 0.25 + Math.sin(elapsedTime * 2.0) * 0.1;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [predictedClass, defect3DPosition]);

  // Camera Presets
  const setCameraView = (view) => {
    setActivePreset(view);
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    switch (view) {
      case "lateral": // Side profile like user reference image
        camera.position.set(6.2, 0.5, 0.0);
        break;
      case "anterior": // Frontal view
        camera.position.set(0.0, 0.5, 6.2);
        break;
      case "superior": // Axial top-down view
        camera.position.set(0.0, 6.8, 0.01);
        break;
      case "posterior": // Occipital rear view
        camera.position.set(0.0, 0.5, -6.2);
        break;
      case "isometric":
      default:
        camera.position.set(4.2, 2.0, 5.0);
        break;
    }
    controls.target.set(0, 0, 0);
    controls.update();
  };

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden bento-card border border-cyan-500/20 shadow-2xl transition-all ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen bg-[#030712]" : "h-[620px]"
      }`}
    >
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Floating Glass Bar: Telemetry & Orientation */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Dynamic Pathology Floating Pill (matches reference image) */}
        <div className="pointer-events-auto flex items-center gap-3">
          <div className="bento-glass px-4 py-2.5 rounded-xl border border-cyan-500/30 shadow-lg flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Real-Time Defect Localization
              </div>
              <div className="text-sm font-extrabold text-cyan-300 font-display flex items-center gap-2">
                <span>{defectMetadata.regionName}</span>
                <span className="text-amber-400 font-mono text-xs font-black">
                  {defectMetadata.saliencyPct}% Peak
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Camera Presets & Fullscreen */}
        <div className="pointer-events-auto flex items-center gap-2 bento-glass px-3 py-1.5 rounded-xl border border-white/10">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:block">
            View Angle
          </div>
          {[
            { id: "isometric", label: "3D Iso" },
            { id: "lateral", label: "Lateral" },
            { id: "superior", label: "Axial" },
            { id: "anterior", label: "Coronal" },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => setCameraView(preset.id)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                activePreset === preset.id
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              {preset.label}
            </button>
          ))}

          <div className="w-[1px] h-4 bg-white/10 mx-1" />

          {/* Auto Rotate Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1.5 rounded-lg transition-all ${
              autoRotate ? "text-cyan-400 bg-cyan-500/20" : "text-slate-400 hover:text-white"
            }`}
            title={autoRotate ? "Pause Rotation" : "Auto Rotate"}
          >
            {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-all"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Bottom Floating Legend & Layer Toggles (Inspired by user image) */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Anatomical Connectome Legend */}
        <div className="pointer-events-auto bento-glass px-4 py-2.5 rounded-xl border border-white/10 flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-xs shadow-cyan-400/50" />
            <span className="text-slate-300">Cerebral Cortex</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-xs shadow-blue-500/50" />
            <span className="text-slate-300">Neural Pathways</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-xs shadow-amber-400/80" />
            <span className="text-amber-300 font-semibold">Grad-CAM Defect</span>
          </div>
        </div>

        {/* Real-time Grad-CAM Coordinates Telemetry Badge */}
        <div className="pointer-events-auto bento-glass px-3.5 py-2 rounded-xl border border-white/10 text-xs font-mono text-slate-400 flex items-center gap-3">
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>
            3D Vector: [
            <span className="text-cyan-300 font-semibold">{defect3DPosition.x.toFixed(2)}</span>,{" "}
            <span className="text-cyan-300 font-semibold">{defect3DPosition.y.toFixed(2)}</span>,{" "}
            <span className="text-cyan-300 font-semibold">{defect3DPosition.z.toFixed(2)}</span>]
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            60 FPS WebGL
          </span>
        </div>
      </div>
    </div>
  );
}
