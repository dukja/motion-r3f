import React, { useEffect, useContext } from "react";
import { gsap } from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import Item from "./Item";
import { TimelineContext } from "./../../index";

const Obj = ({ scrollTriggerRef }) => {
  const sharedTimeline = useContext(TimelineContext);

  let animFirst = {
    x: -3,
    y: -3,
  };
  let animScondary = {
    y: 0,
  };

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
      tl1.to(animFirst, {
        x: 3,
        y: 3,
      });

      const tl3 = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRefs[1],
          start: "top top",
          endTrigger: sectionRefs[2],
          end: "bottom bottom",
          markers: true,
          scrub: 1,
        },
      });
      tl3.to(animScondary, {
        y: 3.3,
      });

      const tl2 = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRefs[2],
          start: "top top",
          endTrigger: sectionRefs[4],
          end: "bottom bottom",
          markers: true,
          scrub: 1,
        },
      });
      tl2.to(animFirst, {
        x: -3,
      });

      // 공유 타임라인에 개별 타임라인 추가
      sharedTimeline.add(tl1, 0);
      sharedTimeline.add(tl3, 0);
      sharedTimeline.add(tl2, 0);
    }
  }, [scrollTriggerRef, sharedTimeline]);

  return (
    <>
      <Item animFirst={animFirst} animScondary={animScondary} />
    </>
  );
};

export default Obj;
