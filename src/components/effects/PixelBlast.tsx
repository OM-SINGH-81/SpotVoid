// Component inspired by github.com/zavalit/bayer-dithering-webgl-demo
"use client"
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uSpeed;
  uniform float uPatternScale;
  uniform float uPatternDensity;
  uniform vec3 uColor;
  uniform bool uTransparent;
  uniform float uPixelSize;
  uniform float uPixelSizeJitter;
  uniform float uEdgeFade;

  // Ripples
  uniform bool uEnableRipples;
  uniform float uRippleSpeed;
  uniform float uRippleThickness;
  uniform float uRippleIntensityScale;

  // Liquid
  uniform bool uLiquid;
  uniform float uLiquidStrength;
  uniform float uLiquidRadius;
  uniform float uLiquidWobbleSpeed;

  // Variant
  uniform int uVariant; // 0: square, 1: circle

  // Bayer matrix for dithering
  const mat4 bayerMatrix = mat4(
    0.0, 8.0, 2.0, 10.0,
    12.0, 4.0, 14.0, 6.0,
    3.0, 11.0, 1.0, 9.0,
    15.0, 7.0, 13.0, 5.0
  ) / 16.0;

  float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
  }

  void main() {
    vec2 st = vUv;
    vec3 color = uColor;
    float alpha = 1.0;

    // Liquid distortion
    if (uLiquid) {
      float angle = uTime * uLiquidWobbleSpeed;
      vec2 offset = vec2(cos(angle), sin(angle)) * uLiquidRadius;
      float dist = distance(st, vec2(0.5) + offset * 0.2);
      st.x += (0.5 - st.x) * sin(dist * uLiquidStrength - uTime) * 0.1;
      st.y += (0.5 - st.y) * cos(dist * uLiquidStrength - uTime) * 0.1;
    }

    // Main shape
    if (uVariant == 1) { // Circle
        float dist = distance(st, vec2(0.5));
        alpha = 1.0 - smoothstep(0.48, 0.5, dist);
    }

    // Edge fade
    if (uEdgeFade > 0.0) {
      float edgeDist = min(st.x, 1.0 - st.x);
      edgeDist = min(edgeDist, st.y);
      edgeDist = min(edgeDist, 1.0 - st.y);
      alpha *= smoothstep(0.0, uEdgeFade, edgeDist);
    }
    
    // Pixelation
    float pSize = uPixelSize;
    if (uPixelSizeJitter > 0.0) {
        vec2 gridUv = floor(st * 100.0) / 100.0;
        pSize += rand(gridUv) * uPixelSizeJitter - uPixelSizeJitter * 0.5;
        pSize = max(1.0, pSize);
    }
    vec2 pixelUv = round(st * pSize) / pSize;


    // Pattern
    float pattern = 0.0;
    float scaledTime = uTime * uSpeed;
    pattern = (sin(pixelUv.x * uPatternScale + scaledTime) + cos(pixelUv.y * uPatternScale + scaledTime)) * 0.5;
    pattern = smoothstep(uPatternDensity, uPatternDensity + 0.1, pattern);
    alpha *= pattern;

    // Dithering
    vec2 ditherUv = gl_FragCoord.xy;
    float dither = bayerMatrix[int(mod(ditherUv.x, 4.0))][int(mod(ditherUv.y, 4.0))];
    alpha = smoothstep(dither - 0.1, dither + 0.1, alpha);

    // Ripples
    if (uEnableRipples) {
      float rippleTime = uTime * uRippleSpeed;
      float ripple = sin(distance(st, vec2(0.5)) * 20.0 - rippleTime);
      ripple = smoothstep(1.0 - uRippleThickness, 1.0, ripple);
      ripple *= (1.0 - distance(st, vec2(0.5)) * uRippleIntensityScale);
      alpha = max(alpha, ripple);
    }


    if (uTransparent && alpha < 0.1) discard;

    gl_FragColor = vec4(color, alpha);
  }
`;

type PixelBlastProps = {
  variant?: 'square' | 'circle';
  pixelSize?: number;
  color?: string;
  patternScale?: number;
  patternDensity?: number;
  pixelSizeJitter?: number;
  enableRipples?: boolean;
  rippleSpeed?: number;
  rippleThickness?: number;
  rippleIntensityScale?: number;
  liquid?: boolean;
  liquidStrength?: number;
  liquidRadius?: number;
  liquidWobbleSpeed?: number;
  speed?: number;
  edgeFade?: number;
  transparent?: boolean;
  style?: React.CSSProperties;
  className?: string;
};

const PixelBlast: React.FC<PixelBlastProps> = ({
  variant = 'square',
  pixelSize = 10,
  color = '#B19EEF',
  patternScale = 3,
  patternDensity = 1.2,
  pixelSizeJitter = 0.5,
  enableRipples = false,
  rippleSpeed = 0.4,
  rippleThickness = 0.12,
  rippleIntensityScale = 1.5,
  liquid = false,
  liquidStrength = 0.12,
  liquidRadius = 1.2,
  liquidWobbleSpeed = 5,
  speed = 0.6,
  edgeFade = 0.25,
  transparent = false,
  style,
  className
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;
    
    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.z = 1;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    // Geometry
    const geometry = new THREE.PlaneGeometry(2, 2);

    // Uniforms
    const uniforms = {
      uTime: { value: 0.0 },
      uSpeed: { value: speed },
      uColor: { value: new THREE.Color(color) },
      uTransparent: { value: transparent },
      uPixelSize: { value: pixelSize },
      uPatternScale: { value: patternScale },
      uPatternDensity: { value: patternDensity },
      uPixelSizeJitter: { value: pixelSizeJitter },
      uEdgeFade: { value: edgeFade },
      uEnableRipples: { value: enableRipples },
      uRippleSpeed: { value: rippleSpeed },
      uRippleThickness: { value: rippleThickness },
      uRippleIntensityScale: { value: rippleIntensityScale },
      uLiquid: { value: liquid },
      uLiquidStrength: { value: liquidStrength },
      uLiquidRadius: { value: liquidRadius },
      uLiquidWobbleSpeed: { value: liquidWobbleSpeed },
      uVariant: { value: variant === 'circle' ? 1 : 0 },
    };

    // Material
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      blending: THREE.NormalBlending,
    });

    // Mesh
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Controls
    // const controls = new OrbitControls(camera, renderer.domElement);
    // controls.enableDamping = true;

    // Resize handler
    const handleResize = () => {
      if (currentMount) {
        camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      uniforms.uTime.value = clock.getElapsedTime();
      // controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if(currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
    };
  }, [
    variant, pixelSize, color, patternScale, patternDensity, pixelSizeJitter,
    enableRipples, rippleSpeed, rippleThickness, rippleIntensityScale,
    liquid, liquidStrength, liquidRadius, liquidWobbleSpeed,
    speed, edgeFade, transparent
  ]);

  return <div ref={mountRef} style={style} className={className} />;
};

export default PixelBlast;
