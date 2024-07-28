import React, { useEffect, useRef } from "react";
import { useScroll } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";

import gsap from "gsap";
let timeline;

import Item from "./Item";
function Obj() {
  const { width, height } = useThree((state) => state.viewport);
  const data = useScroll();
  const groupRef = useRef();
  // useEffect(() => {
  //   timeline = gsap.timeline();
  //   timeline.fromTo(
  //     groupRef.current.rotation,
  //     { z: Math.PI },
  //     { z: 0, duration: 2.5 }
  //   );
  // });
  // useFrame(() => {
  //   timeline.seek(scroll.offset * timeline.duration());
  // });
  useFrame(() => {
    if (groupRef.current) {
      // 스크롤 위치에 따라 다양한 움직임 적용
      const scrollOffset = data.offset;
      const totalHeight = height * 4; // 전체 이동할 높이 설정

      // 스크롤 위치에 따라 X축 기준으로 회전
      if (scrollOffset < 0.25) {
        const rotationX = (scrollOffset / 0.25) * Math.PI * 2; // 0에서 0.25까지 스크롤 시 0에서 2π까지 회전
        groupRef.current.rotation.x = rotationX;
      }
      // 스크롤이 0.25 이상 0.5 미만일 때는 Y축으로 이동
      else if (scrollOffset >= 0.25 && scrollOffset < 0.5) {
        const moveY = ((scrollOffset - 0.25) / 0.25) * totalHeight; // 0.25에서 0.5까지 스크롤 시 0에서 totalHeight까지 이동
        groupRef.current.position.y = -moveY;
      }
      // 스크롤이 0.5 이상일 때는 Z축 기준으로 회전
      else if (scrollOffset >= 0.5) {
        const rotationZ = ((scrollOffset - 0.5) / 0.5) * Math.PI * 2; // 0.5에서 1까지 스크롤 시 0에서 2π까지 회전
        groupRef.current.rotation.z = rotationZ;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <Item />
    </group>
  );
}

export default Obj;
