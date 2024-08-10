"use client";
import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import styled from "styled-components";
import "tailwindcss/tailwind.css";

gsap.registerPlugin(ScrollTrigger);

const totalScrollHeight = 300; // 원하는 총 스크롤 높이 (vh)

const ContentDiv = styled.div`
  height: ${totalScrollHeight}vh;
`;

const SectionDiv = styled.div`
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
`;

const ScrollTrig = ({ children }) => {
  const contentRef = useRef(null);
  const sectionRefs = useRef([]);

  useEffect(() => {
    const sections = sectionRefs.current;

    sections.forEach((section, index) => {
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${section.offsetHeight}`,
        pin: true,
        pinSpacing: false,
        markers: true,
        onUpdate: (self) => {
          console.log(`Section ${index} progress:`, self.progress);
        },
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <ContentDiv ref={contentRef}>
      {React.Children.map(children, (child, index) => (
        <SectionDiv
          ref={(el) => (sectionRefs.current[index] = el)}
          key={index}
          className={`scrollTrigger-${index} section`}
          style={{ backgroundColor: `hsl(${index * 120}, 70%, 80%)` }}
        >
          {child}
        </SectionDiv>
      ))}
    </ContentDiv>
  );
};

const MainApp = () => {
  return (
    <ScrollTrig>
      <div>Section 0</div>
      <div>Section 1</div>
      <div>Section 2</div>
    </ScrollTrig>
  );
};

export default MainApp;
