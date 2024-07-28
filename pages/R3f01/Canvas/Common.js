"use client";
import React, { useRef } from "react";

import { DirectionalLightHelper } from "three";
import { useHelper } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

function Common(color) {
  const { scene } = useThree();
  const ref = useRef();
  useHelper(ref, DirectionalLightHelper, 0.5, "red");
  return (
    <>
      {color && <color attach="background" color={[color]} />}
      <mesh receiveShadow position={[0, -2, -5]}>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial attach="material" opacity={0.3} color="black" />
      </mesh>
    </>
  );
}

export default Common;
