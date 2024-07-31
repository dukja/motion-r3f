"use client";
import React, { Suspense, lazy, useRef } from "react";

import ScrollTrig from "./Canvas/ScrollTrig";
import { Canvas } from "@react-three/fiber";
import { Html, Scroll, ScrollControls } from "@react-three/drei";

import styled from "styled-components";
import ScrollTextWrap from "./Animation/(ObjText)/ScrollTextWrap";
import TimelineBoxWrap from "./Object/(Text)/TimelineSectionWrap";

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
const ScrollStyled = styled(Scroll)`
  width: 100%;
  height: 100%;
  overflow: scroll;
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
            <ScrollControls pages={0}>
              <MainCanvas scrollTriggerRef={scrollTriggerRef} />
              <gridHelper args={[40, 40]} rotation-x={[Math.PI / 2]} />
              <ScrollStyled html>
                <TimelineBoxWrap scrollTriggerRef={scrollTriggerRef} />
              </ScrollStyled>
            </ScrollControls>
          </Canvas>
          <ScrollTrig ref={scrollTriggerRef} />
        </div>
      </Suspense>
    </>
  );
}

export default MainApp;
