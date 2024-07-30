"use client";
import * as THREE from "three";
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Image } from "@react-three/drei";

function ItemImage({ c = new THREE.Color(), children, content, ...props }) {
  const ImagerRef = useRef();
  const [hovered, hover] = useState(false);
  useFrame(() => {
    ImagerRef.current.material.color.lerp(
      c.set(hovered ? "white" : "#ccc"),
      hovered ? 0.4 : 0.05
    );
  });
  return (
    <Image
      ref={ImagerRef}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}
      {...props}
    >
      <Html
        position={[0, 0, 0]}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <div style={{ color: "white", fontSize: "20px" }}>{content}</div>
      </Html>
    </Image>
  );
}

export default ItemImage;
