"use client";
import React, { forwardRef, useRef, useImperativeHandle } from "react";
import styled from "styled-components";

const ContentDiv = styled.div`
  border: 1px solid yellow;
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

  return (
    <ContentDiv ref={contentRef}>
      {Array(5)
        .fill(null)
        .map((_, index) => (
          <SectionDiv
            ref={(el) => (sectionRefs.current[index] = el)}
            key={index}
            className={`scrollTrigger-0${index + 1} section`}
          >
            {props.children[index]}
          </SectionDiv>
        ))}
    </ContentDiv>
  );
});

export default ScrollTrig;
