import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
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

  useEffect(() => {
    if (scrollTriggerRef && scrollTriggerRef.current) {
      const contentRef = scrollTriggerRef.current.getContentRef();
      const scrollingElement = scrollingRef.current;

      if (scrollingElement) {
        const speedFactor = 1; // 이 값을 조정하여 속도를 조절할 수 있습니다.

        ScrollTrigger.create({
          trigger: contentRef,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          markers: true,
          onUpdate: (self) => {
            const scrollPosition = self.scroll();
            gsap.set(scrollingElement, {
              x: -scrollPosition * speedFactor,
            });
          },
        });
      }
    }

    return () => {
      // 컴포넌트 언마운트 시 ScrollTrigger 정리
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [scrollTriggerRef]);

  return (
    <ScrollingDiv ref={scrollingRef}>
      <AutoMovingText />
      <ScrollText />
    </ScrollingDiv>
  );
};

export default ScrollTextWrap;
