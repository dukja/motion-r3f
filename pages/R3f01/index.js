"use client";
import React, { Suspense, lazy, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Scroll, ScrollControls } from "@react-three/drei";
import styled from "styled-components";
import ScrollTextWrap from "./Animation/(ObjText)/ScrollTextWrap";
import TimelineSection from "./Object/(Text)/TimelineSectionWrap/TimelineSection";
import ScrollTrig from "./Canvas/ScrollTrig";

const MainCanvas = lazy(() => import("./Canvas/index"));

const UIContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

const AnimationElement = styled.div`
  position: absolute;
  top: 100vh;
  width: 100vh;
  height: 50px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border: 1px solid red;
  pointer-events: auto;
  transform: rotate(-90deg);
  transform-origin: left top;
`;

function MainApp() {
  const scrollTriggerRef = useRef();

  return (
    <>
      <Suspense fallback={<div>loading</div>}>
        <UIContainer>
          <AnimationElement>
            <ScrollTextWrap />
          </AnimationElement>
        </UIContainer>
        <div className="canvas3D">
          <Canvas
            shadows
            camera={{ position: [0, 0, 10] }}
            gl={{ antialias: false }}
          >
            <ScrollControls pages={3} damping={2}>
              <Scroll>
                <MainCanvas scrollTriggerRef={scrollTriggerRef} />
              </Scroll>
            </ScrollControls>
          </Canvas>
        </div>
        <ScrollTrig ref={scrollTriggerRef}>
          <div>1</div>
          <TimelineSection />
          <div>3</div>
          <div>4</div>
        </ScrollTrig>
      </Suspense>
    </>
  );
}

export default MainApp;
