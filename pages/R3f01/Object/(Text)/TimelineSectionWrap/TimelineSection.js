"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import "tailwindcss/tailwind.css";

function TimelineSection() {
  const boxRef = useRef(null);
  const textLeftRef1 = useRef(null);
  const textLeftRef2 = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(
      textLeftRef1.current,
      { x: "-100%", opacity: 0 },
      { x: "0%", opacity: 1 }
    )
      .fromTo(
        textLeftRef2.current,
        { x: "-100%", opacity: 0 },
        { x: "0%", opacity: 1 },
        "-=0.5"
      )
      .to(boxRef.current, {
        width: "100px",
        height: "100px",
        x: "calc(50vw - 50px)",
        y: "calc(50vh - 50px)",
        duration: 1,
        delay: 2,
      })
      .to(boxRef.current, {
        y: "-50vh",
        duration: 1,
        delay: 1,
      });
  }, []);

  return (
    <div className="relative h-screen flex flex-col justify-center items-center bg-gray-100">
      <div
        ref={boxRef}
        className="box border-4 border-blue-500 w-64 h-64 rounded-lg shadow-lg flex flex-col justify-center items-center bg-white"
      >
        <p
          ref={textLeftRef1}
          className="text-left-1 absolute top-0 left-0 text-2xl text-green-500"
        >
          #01 Left to Center
        </p>
        <p
          ref={textLeftRef2}
          className="text-left-2 absolute bottom-0 left-0 text-2xl text-green-500"
        >
          Visual Languages
        </p>
      </div>
    </div>
  );
}

export default TimelineSection;
