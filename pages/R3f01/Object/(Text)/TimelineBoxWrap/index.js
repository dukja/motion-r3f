// pages/Animation/(ObjItem)/TimelineBoxWrap.js
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import styled from "styled-components";
import Items from "./Items";

gsap.registerPlugin(ScrollTrigger);

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  width: 100vw;
  display: flex;
  border: 10px solid green;
`;

const Box = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  border: 10px solid skyblue;
`;

const Text = styled.div`
  position: absolute;
  left: 100%;
  white-space: nowrap;
  font-size: 24px;
`;

export default function TimelineBoxWrap({ scrollTriggerRef }) {
  const boxRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    if (scrollTriggerRef && scrollTriggerRef.current) {
      const sectionRefs = scrollTriggerRef.current.getSectionRefs();

      const tl1 = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRefs[0],
          start: "top top",
          endTrigger: sectionRefs[1],
          end: "bottom bottom",
          snap: 1,
          scrub: 1,
          markers: true,
        },
      });
      tl1
        .to(textRef.current, {
          xPercent: 0,
        })
        .to(textRef.current, {
          xPercent: 100,
        });

      const tl2 = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRefs[1],
          start: "top top",
          endTrigger: sectionRefs[2],
          end: "bottom bottom",
          markers: true,
          scrub: 1,
        },
      });
      tl2.to(boxRef.current, {
        width: 100,
        height: 100,
        x: "+=300",
      });
    }
  }, [scrollTriggerRef]);

  return (
    <Container>
      <Box ref={boxRef}>
        <ObjText01 />
      </Box>
      <Box ref={boxRef}>
        <Items />
      </Box>
    </Container>
  );
}
