"use client";
import React, { forwardRef, useRef, useImperativeHandle } from "react";

const ScrollTrig = forwardRef((props, ref) => {
  const sectionRefs = useRef([]);
  useImperativeHandle(ref, () => ({
    getSectionRefs: () => sectionRefs.current,
  }));

  return (
    <div className="content">
      {Array(5)
        .fill(null)
        .map((_, index) => (
          <div
            ref={(el) => (sectionRefs.current[index] = el)}
            key={index}
            className={`scrollTrigger-0${index + 1} section`}
            style={{
              height: "100vh",
              width: "100vw",
              border: "1px solid red",
            }}
          ></div>
        ))}
    </div>
  );
});

export default ScrollTrig;
