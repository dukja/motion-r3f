"use client";
import React, { useEffect, useRef } from "react";
import { useScroll } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";

import ItemImage from "./ItemImg";
function ObjImg() {
  const { width, height } = useThree((state) => state.viewport);
  const data = useScroll();
  const groupRef = useRef();

  useFrame(() => {
    groupRef.current.children[0].material.zoom = 1 + data.range(0, 1 / 3) / 3;
    groupRef.current.children[1].material.zoom = 1 + data.range(0, 1 / 3) / 3;
    groupRef.current.children[2].material.zoom =
      1 + data.range(1.15 / 3, 1 / 3) / 3;
    groupRef.current.children[3].material.zoom =
      1 + data.range(1.15 / 3, 1 / 3) / 2;
    groupRef.current.children[4].material.zoom =
      1 + data.range(1.25 / 3, 1 / 3) / 1;
    groupRef.current.children[5].material.zoom =
      1 + data.range(1.8 / 3, 1 / 3) / 3;
    groupRef.current.children[5].material.grayscale =
      1 - data.range(1.6 / 3, 1 / 3);
    groupRef.current.children[6].material.zoom =
      1 + (1 - data.range(2 / 3, 1 / 3)) / 3;
  });
  return (
    <group ref={groupRef}>
      <ItemImage
        position={[-2, 0, 0]}
        scale={[4, height, 1]}
        url="/image/img1.jpg"
        content="1-1"
      />
      <ItemImage
        position={[2, 0, 0]}
        scale={3}
        url="/image/img6.jpg"
        content="1-2"
      />
      <ItemImage
        position={[-3, -height, 1]}
        scale={[2, 4, 1]}
        url="/image/trip2.jpg"
        content="2-1"
      />
      <ItemImage
        position={[0, -height, 2]}
        scale={[1, 3, 1]}
        url="/image/img8.jpg"
        content="2-2"
      />
      <ItemImage
        position={[1, -height, 3]}
        scale={[1, 2, 1]}
        url="/image/trip4.jpg"
        content="2-3"
      />
      <ItemImage
        position={[0, -height * 1.5, 2.5]}
        scale={[1.5, 3, 1]}
        url="/image/img3.jpg"
        content="3-1"
      />
      <ItemImage
        position={[0, -height * 2 - height / 4, 0]}
        scale={[width, height / 2, 1]}
        url="/image/img7.jpg"
        content="4-1"
      />
    </group>
  );
}

export default ObjImg;
