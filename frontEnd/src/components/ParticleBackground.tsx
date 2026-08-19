import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ParticleBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    // Track scroll position
    const handleScroll = () => {
      scrollRef.current = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll);

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Particle configuration
    const particleCount = 3000;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Randomly position particles in a tunnel-like volume
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 1) * 100;
      // REDUCED VELOCITY: Now between 0.02 and 0.08 for a controlled drift
      velocities[i] = 0.02 + Math.random() * 0.06;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Use a glowing circle texture
    const createCircle = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.Texture();

      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'white');
      grad.addColorStop(0.5, 'rgba(163, 230, 53, 0.5)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
      const tex = new THREE.Texture(canvas);
      tex.needsUpdate = true;
      return tex;
    };

    const material = new THREE.PointsMaterial({
      size: 0.5,
      map: createCircle(),
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      sizeAttenuation: true,
    });

    const starField = new THREE.Points(geometry, material);
    scene.add(starField);

    // Interaction
    let mouseX = 0,
      mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.005;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.005;
    };

    document.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);

      const pos = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        // Move particle forward (positive Z)
        pos[i * 3 + 2] += velocities[i];

        // If particle passes the camera, reset it to the far background
        if (pos[i * 3 + 2] > 5) {
          pos[i * 3 + 2] = -95;
          pos[i * 3] = (Math.random() - 0.5) * 100;
          pos[i * 3 + 1] = (Math.random() - 0.5) * 100;
        }
      }
      (geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;

      // Subtle camera tilt
      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.position.y += (-mouseY - camera.position.y) * 0.05;

      // Add scroll-based parallax effect
      camera.position.z = 5 + (scrollRef.current * 0.001);
      camera.lookAt(0, 0, -20);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        zIndex: -1,
      }}
    />
  );
};

export default ParticleBackground;
