"use client";
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

function Item({ animFirst, animScondary }) {
  const animFirstRef = useRef();
  const animScondaryRef = useRef();

  useFrame(() => {
    if (animFirstRef.current) {
      animFirstRef.current.position.x = -2 * animFirst.x;
      animFirstRef.current.rotation.y = -1.5 * animFirst.y;
      animFirstRef.current.position.y = -1.5 * animFirst.y;
    }
    if (animScondaryRef.current) {
      animScondaryRef.current.position.y = -1.5 * animScondary.y;
    }
  });

  return (
    <group>
      <mesh castShadow ref={animFirstRef} position={[0, 0, 0]}>
        <torusGeometry args={[2, 0.5, 32, 128]} />
        <meshPhongMaterial
          color="red"
          opacity={1}
          shininess={1000}
          metalness={0.2}
        />
      </mesh>
      <mesh castShadow ref={animScondaryRef} position={[0, 0, 0]}>
        <sphereGeometry args={[1, 16, 32]} />
        <meshPhysicalMaterial
          specular={["yellow"]}
          shininess={1000}
          metalness={0.2}
          roughness={0}
          clearcoat={0.8}
        />
      </mesh>
    </group>
  );
}

export default Item;
