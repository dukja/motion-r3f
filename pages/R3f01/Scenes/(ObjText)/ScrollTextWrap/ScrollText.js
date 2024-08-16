import React, { useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import styled from "styled-components";

gsap.registerPlugin(ScrollTrigger);

const LateralInnerContainer = styled.div`
  display: flex;
  position: absolute;
  left: 50vw;
  white-space: nowrap;
  line-height: 50px;
`;

const LateralInnerMovement = () => {
  // useEffect(() => {
  //   const lateralInner = document.querySelector("#lateralinner");

  //   if (lateralInner) {
  //     gsap.set(lateralInner, {
  //       x: 0,
  //     });

  //     ScrollTrigger.create({
  //       trigger: lateralInner,
  //       start: "top top",
  //       end: "bottom bottom",
  //       scrub: true,
  //       onUpdate: (self) => {
  //         gsap.to(lateralInner, {
  //           x: -self.progress * (3000 * window.innerWidth), // 움직일 거리를 설정
  //           ease: "none",
  //         });
  //       },
  //     });
  //   }

  //   return () => {
  //     ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  //   };
  // }, []);

  return (
    <LateralInnerContainer>
      <div>AUTHENTIC DIGITAL PRODUCTS © SELF SERVICE STORE</div>
      <div>PRODUCTS AVAILABLE 365 DAYS</div>
      <div>VERY LIMITED QUANTITY AVAILABLE</div>
      <div>CONSUME RESPONSIBLY</div>
      <div>HARD WORK WARRANTY</div>
      <div>FEATURED IN</div>
      <div>NO STANDARD PRICES</div>
    </LateralInnerContainer>
  );
};

export default LateralInnerMovement;
