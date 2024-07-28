"use client";
import React, { useRef } from "react";

import { DirectionalLightHelper } from "three";
import { useHelper } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

function Light() {
  // const { scene } = useThree();
  // const ref = useRef();
  // useHelper(ref, DirectionalLightHelper, 0.5, "red");
  return (
    <>
      {/* <ambientLight intensity={0.5} /> */}
      {/* <pointLight position={[10, 10, 10]} color="blue" /> */}
      <directionalLight
        castShadow
        position={[0, 10, 20]}
        intensity={0.9}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
    </>
  );
}

export default Light;
