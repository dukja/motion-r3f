import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import { useFrame } from "@react-three/fiber";
import styled from "styled-components";
import AutoMovingText from "./AutoMovingText";
import ScrollText from "./ScrollText";

gsap.registerPlugin(ScrollTrigger);

const ScrollingDiv = styled.div`
  position: relative;
  border: 1px solid blue;
  width: 100%;
  height: 100%;
  display: flex;
`;

const ScrollTextWrap = ({ scrollTriggerRef }) => {
  const scrollingRef = useRef(null);

  useFrame(() => {
    if (scrollTriggerRef && scrollTriggerRef.current) {
      const contentRef = scrollTriggerRef.current.getContentRef();
      const scrollingElement = scrollingRef.current;

      if (scrollingElement) {
        const contentLength = contentRef.scrollHeight;
        const scrollingLength = scrollingElement.scrollWidth;
        const speedFactor = scrollingLength / contentLength;
        const scrollPosition = window.scrollY;

        gsap.set(scrollingElement, {
          x: -scrollPosition * speedFactor,
        });
      }
    }
  });

  return (
    <ScrollingDiv ref={scrollingRef}>
      <AutoMovingText />
      <ScrollText />
    </ScrollingDiv>
  );
};

export default ScrollTextWrap;
