import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import styled from "styled-components";

const MovingText = styled.div`
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 7vw;
  overflow: hidden;
  position: relative;
  white-space: nowrap;
`;

const InnerText = styled.div`
  display: inline-block;
  white-space: nowrap;
  text-align: center;
  text-transform: uppercase;
  line-height: 2;
`;

const textContent = "© Welcome to silencio store";

const AutoMovingText = () => {
  const textContainerRef = useRef(null);
  const textRefs = useRef([]);

  useEffect(() => {
    const textWidth = textContainerRef.current.scrollWidth / 2;

    gsap.to(textRefs.current, {
      x: `-=${textWidth}`,
      duration: 6,
      ease: "none",
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize((x) => parseFloat(x) % textWidth),
      },
    });
  }, []);

  return (
    <MovingText ref={textContainerRef}>
      {Array.from({ length: 2 }).map((_, i) => (
        <InnerText ref={(el) => (textRefs.current[i] = el)} key={i}>
          {textContent}
        </InnerText>
      ))}
    </MovingText>
  );
};

export default AutoMovingText;
