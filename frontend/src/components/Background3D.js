'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Background3D() {
  // Create rotating cube geometry
  function RotatingCube() {
    const mesh = useRef();
    
    useFrame((state, delta) => {
      mesh.current.rotation.x += 0.01;
      mesh.current.rotation.y += 0.01;
    });

    return (
      <mesh ref={mesh} position={[0, 0, 0]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial 
          color={0x00ffff} 
          emissive={0x00ffff}
          emissiveIntensity={0.5}
          transparent
          opacity={0.3}
        />
      </mesh>
    );
  }

  // Create particle system
  function ParticleSystem() {
    const positions = [];
    const colors = [];
    const count = 5000;

    for (let i = 0; i < count; i++) {
      // Position
      positions.push(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );
      
      // Color
      colors.push(
        Math.random() * 0.5 + 0.5,
        Math.random() * 0.5 + 0.5,
        Math.random() * 0.5 + 0.5
      );
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.02,
      vertexColors: true,
      transparent: true,
      opacity: 0.6
    });

    const points = useRef();
    useFrame((state, delta) => {
      points.current.rotation.y += 0.002;
    });

    return <points ref={points} geometry={geometry} material={material} />;
  }

  return (
    <Canvas 
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}
      camera={{ position: [0, 0, 5], fov: 75 }}
    >
      {/* Lights */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />
      
      {/* Background elements */}
      <RotatingCube />
      <ParticleSystem />
      
      {/* Optional: animated gradient mesh background */}
      <mesh>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial 
          color={0x1a1f2e} 
          emissive={0x0f1a2e}
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
        />
      </mesh>
    </Canvas>
  );
}