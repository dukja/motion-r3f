"use client";
import React, { useEffect, useRef, useState } from "react";

import { Scroll, Text, useScroll } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { Box, Divider, Hidden, Stack, Typography } from "@mui/material";
import styled from "styled-components";

// gsap.registerPlugin(ScrollTrigger);

function ObjText01() {
  const { viewport } = useThree();

  const s11textRef = useRef();
  const triggerRef = useRef();
  const s12textRefs = useRef([]);
  const s13textRefs = useRef([]);
  const s14textRef = useRef([]);
  const s15textRef = useRef([]);
  useEffect(() => {
    // timeline 생성 및 scrollTrigger 설정
    const tl = gsap.timeline();

    // timeline에 애니메이션 추가
    tl.fromTo(
      s11textRef.current,
      {
        top: "50%", // 시작 위치: 화면 중앙
      },
      {
        top: "20%", // 종료 위치: 화면 상단의 20%
        duration: 1, // 애니메이션 지속 시간
        ease: "power1.out", // 애니메이션 효과
      }
    );
    s12textRefs.current.forEach((el, index) => {
      tl.fromTo(
        el,
        { y: "100%", autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.5, ease: "power1.out" },
        `+=${index * 0.1}` // s11textRef 애니메이션이 끝난 후 순차적으로 실행
      );
    });
    s13textRefs.current.forEach((el, index) => {
      tl.fromTo(
        el,
        { y: "100%", autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.5, ease: "power1.out" },
        `+=${index * 0.1}` // s11textRef 애니메이션이 끝난 후 순차적으로 실행
      );
    });
    tl.fromTo(
      s14textRef.current,
      {
        top: 100,
        opacity: 0, // 시작 위치: 화면 중앙
      },
      {
        top: 0,
        opacity: 0, // 종료 위치: 화면 상단의 20%
        duration: 1, // 애니메이션 지속 시간
        ease: "power1.out", // 애니메이션 효과
      }
    );
  });
  const digitalText = (letters, ref) =>
    letters.split("").map((letter, index) => (
      <Typography
        key={index}
        ref={(el) => (ref.current[index] = el)}
        variant="h1"
      >
        {letter}
      </Typography>
    ));

  return (
    <ScrollSt html>
      <Stack ref={triggerRef}>
        <Typography
          ref={s11textRef}
          variant="h6"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          SILENCIO VISUAL LANGUAGES
        </Typography>
        <Stack
          direction="row"
          sx={{
            overflow: "hidden",
            position: "absolute",
            top: "30%", // 각 글자의 위치를 조정
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          {digitalText("DIGTAL", s12textRefs)}
        </Stack>
        <Stack
          direction="row"
          sx={{
            overflow: "hidden",
            position: "absolute",
            top: "40%", // 각 글자의 위치를 조정
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          {digitalText("PRODUCTS", s13textRefs)}
        </Stack>
        <Stack ref={s14textRef}>
          <Typography
            ref={s14textRef}
            variant="h6"
            sx={{
              position: "absolute",
              top: "50%", // 각 글자의 위치를 조정
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            FOR CONTEMPORARY BRANDS
          </Typography>
          <Typography
            variant="h6"
            sx={{
              position: "absolute",
              top: "50%", // 각 글자의 위치를 조정
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            FOR CONTEMPORARY BRANDS
          </Typography>
          <Typography
            ref={s14textRef}
            variant="h6"
            sx={{
              position: "absolute",
              top: "50%", // 각 글자의 위치를 조정
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            FOR CONTEMPORARY BRANDS
          </Typography>
        </Stack>
      </Stack>
    </ScrollSt>
  );
}

export default ObjText01;

const ScrollSt = styled(Scroll)`
  width: 100%;
  height: 100%;
`;
