import React, { useRef, useEffect } from "react";
import styled from "styled-components";
import gsap from "gsap";

const TextContainer = styled.div`
  position: absolute;
  top: 100vh;
  left: 0;

  overflow: hidden;
`;

const MovingText = styled.div`
  white-space: nowrap;
  display: inline-block;
`;

const textContent = "© Welcome to silencio store111";

const AutoMovingText = () => {
  const textContainerRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const textElement = textRef.current;
    if (textElement) {
      const textWidth = textElement.offsetWidth;

      gsap.to(textElement, {
        x: `-=${textWidth}`,
        duration: 20,
        repeat: -1,
        ease: "none",
        modifiers: {
          x: gsap.utils.unitize((x) => parseFloat(x) % textWidth),
        },
      });
    }
  }, []);

  return (
    <TextContainer ref={textContainerRef}>
      <MovingText ref={textRef}>{textContent}</MovingText>
      <MovingText ref={textRef}>{textContent}</MovingText>
    </TextContainer>
  );
};

export default AutoMovingText;
