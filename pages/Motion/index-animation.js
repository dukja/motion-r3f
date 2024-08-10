//index-animation.js
"use client";
import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import styled from "styled-components";
import "tailwindcss/tailwind.css";

gsap.registerPlugin(ScrollTrigger);

const Box = styled.div`
  width: 100px;
  height: 100px;
  background-color: red;
  margin: 50vh 0; // 중간에 위치하도록 마진 설정
`;

const ContentDiv = styled.div`
  height: 300vh; // 충분한 스크롤 공간 확보
`;

const ScrollAnimation = () => {
  const boxRef = useRef(null);

  useEffect(() => {
    const animation = gsap.to(boxRef.current, {
      rotation: 360,
      scale: 1.5,
    });

    ScrollTrigger.create({
      trigger: boxRef.current,
      start: "top center",
      end: "bottom center",
      scrub: 1, // 1초 지연으로 부드러운 스크롤 효과
      animation: animation,
      markers: true,
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <ContentDiv>
      <Box ref={boxRef} className="box" />
    </ContentDiv>
  );
};

const MainApp = () => {
  return <ScrollAnimation />;
};

export default MainApp;
