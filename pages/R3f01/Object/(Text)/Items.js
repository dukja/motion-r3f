"use client";
import React, { useEffect, useRef, useState } from "react";

import { Scroll, useScroll } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { Hidden, Stack, Typography } from "@mui/material";

function ObjText() {
  const { width, height } = useThree((state) => state.viewport);
  const textScrollRef = useRef();
  const textRollRef = useRef();
  const scrollData = useScroll();
  const [textRollWidth, setTextRollWidth] = useState();

  useEffect(() => {
    if (!textRollRef.current) return;
    setTextRollWidth(textRollRef.current.offsetWidth);
    gsap.to(textRollRef.current, {
      x: -textRollWidth, // 텍스트 너비만큼 왼쪽으로 이동
      ease: "none",
      repeat: -1, // 무한 반복
      duration: 4, // 롤링 속도 조정
    });
  });

  useFrame(() => {
    const yPosition = scrollData.offset * window.innerHeight * 2.9;
    if (!textScrollRef.current) return;
    textScrollRef.current.style.transform = `rotate(-90deg) translateX(${-yPosition}px)`;
  });

  return (
    <Scroll html>
      <Stack
        sx={{
          position: "fixed",
          border: "1px solid red",
          width: " 100vh",
          height: "3vw",
          top: " calc(50vh - 2vw)",
          left: "calc(-50vh + 2vw)",
        }}
        ref={textScrollRef}
        direction="row"
      >
        <Stack
          sx={{
            overflow: "hidden",
            width: `${textRollWidth}`,
            height: "100px",
          }}
        >
          <Typography ref={textRollRef}> Rolling Text</Typography>
        </Stack>
        <Typography variant="h3">Scrolling Text</Typography>
      </Stack>
    </Scroll>
  );
}

export default ObjText;
