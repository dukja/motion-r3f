"use client";
import React, { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";

import { ScrollControls, softShadows, Scroll } from "@react-three/drei";

import Common from "./Common";
import Obj from "../Object/(Obj)/Obj";
import Light from "./Light";

const MainCanvas = ({ scrollTriggerRef }) => {
  return (
    <>
      <Light />
      <Obj scrollTriggerRef={scrollTriggerRef} />
    </>
  );
};

export default MainCanvas;
