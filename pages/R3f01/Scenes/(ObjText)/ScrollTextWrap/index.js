import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import styled from "styled-components";
import AutoMovingText from "./AutoMovingText";
import ScrollText from "./ScrollText";

const ScrollingDiv = styled.div`
  position: relative;
  border: 1px solid blue;
  width: 100%;
  height: 100%;
  display: flex;
`;

const ScrollTextWrap = () => {
  const scrollingRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollingElement = scrollingRef.current;

      if (scrollingElement) {
        const speedFactor = 1; // 이 값을 조정하여 속도를 조절할 수 있습니다.
        gsap.set(scrollingElement, {
          x: -scrollPosition * speedFactor, // 반대 방향으로 움직이도록 설정
        });
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <ScrollingDiv ref={scrollingRef}>
      <AutoMovingText />
      <ScrollText />
    </ScrollingDiv>
  );
};

export default ScrollTextWrap;
