"use client";
import React, {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  Children,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import styled from "styled-components";

gsap.registerPlugin(ScrollTrigger);

// 애니메이션 시간과 스크롤 속도를 기반으로 총 스크롤 높이 계산
const animationDuration = 10; // 애니메이션 시간 (초)
const scrollSpeed = 100; // 스크롤 속도 (vh/초)
const totalScrollHeight = animationDuration * scrollSpeed; // 총 스크롤 높이 (vh)

const ContentDiv = styled.div`
  border: 1px solid yellow;
  height: ${totalScrollHeight}vh; /* 계산된 스크롤 높이 적용 */
`;

const SectionDiv = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 10px solid red;
  font-size: 24px;
`;

const ScrollTrig = forwardRef((props, ref) => {
  const contentRef = useRef(null);
  const sectionRefs = useRef([]);
  useImperativeHandle(ref, () => ({
    getSectionRefs: () => sectionRefs.current,
    getContentRef: () => contentRef.current,
  }));

  useEffect(() => {
    ScrollTrigger.create({
      trigger: sectionRefs.current[1],
      start: "top top",
      end: `+=${totalScrollHeight}vh`,
      scrub: true,
      pin: true,
      markers: true,
    });
  }, []);

  return (
    <ContentDiv ref={contentRef}>
      {Children.map(props.children, (child, index) => (
        <SectionDiv
          ref={(el) => (sectionRefs.current[index] = el)}
          key={index}
          className={`scrollTrigger-0${index + 1} section`}
        >
          {child}
        </SectionDiv>
      ))}
    </ContentDiv>
  );
});

export default ScrollTrig;
