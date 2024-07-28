"use client";
import React, { Suspense, lazy, useRef } from "react";

import ScrollTrig from "./Canvas/ScrollTrig";
import { Canvas } from "@react-three/fiber";
import { Html, Scroll, ScrollControls } from "@react-three/drei";
import ObjImg from "./Object/(ObjImg)/ObjImg";
import Common from "./Canvas/Common";
import styled from "styled-components";
import AutoMovingText from "./Animation/(ObjText)/AutoMovingText";

const MainCanvas = lazy(() => import("./Canvas/index"));
function MainApp() {
  const scrollTriggerRef = useRef();

  return (
    <>
      <Suspense fallback={<div>loading</div>}>
        {/* <div className="canvas3DImg">
          <Canvas
            shadows
            camera={{ position: [0, 0, 10] }}
            gl={{ antialias: false }}
          >
            <ScrollControls damping={4} pages={3}>
              <Scroll>
                <ObjImg />
                <Common />
              </Scroll>
            </ScrollControls>
          </Canvas>
        </div> */}
        <div className="canvas3D">
          <div>1</div>
          <Canvas
            shadows
            camera={{ position: [0, 0, 10] }}
            gl={{ antialias: false }}
          >
            <MainCanvas scrollTriggerRef={scrollTriggerRef} />
            <gridHelper args={[40, 40]} rotation-x={[Math.PI / 2]} />
            <Html>
              <div style={{ position: "absolute", top: 0, left: 0 }}>
                <div>
                  <AutoMovingText />
                </div>
              </div>
            </Html>
          </Canvas>
        </div>
      </Suspense>
      <ScrollTrig ref={scrollTriggerRef} />
    </>
  );
}

export default MainApp;
