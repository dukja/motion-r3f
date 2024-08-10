"use client";
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
  createContext,
  useContext,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Scroll, ScrollControls } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import styled from "styled-components";
import "tailwindcss/tailwind.css";

gsap.registerPlugin(ScrollTrigger);

// 상수 정의
const ANIMATION_INITIAL = {
  FIRST: { x: -3, y: -3 },
  SECONDARY: { y: 0 },
};

const ANIMATION_CONFIG = {
  SECTION_HEIGHT: 100, // vh
  DURATION: 1, // seconds
  ROTATION_ANGLE: 360, // degrees
  SCALE_FACTOR: 1.5,
};

const ANIMATION_STAGES = {
  STAGE_1: { x: 3, y: 3 },
  STAGE_2: { y: 3.3 },
  STAGE_3: { x: -3 },
};

const DOM_ANIMATION_STAGES = {
  STAGE_1: { x: 200, y: 200, rotation: 360 },
  STAGE_2: { y: 100 },
  STAGE_3: { x: 0, y: 0, rotation: 0 },
};

// Context 생성
const TimelineContext = createContext({
  mainTimeline: null,
  objectTimeline: null,
});
const ScrollTriggerContext = createContext(null);

// Custom Hooks
const useTimeline = () => {
  const context = useContext(TimelineContext);
  if (context === undefined) {
    throw new Error("useTimeline must be used within a TimelineProvider");
  }
  return context;
};
const useScrollTrigger = () => useContext(ScrollTriggerContext);

// Styled Components
const CanvasContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 1;
`;

const ScrollContent = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 2;
`;

const ContentDiv = styled.div`
  height: ${(props) => props.height}px;
`;

const SectionDiv = styled.div`
  height: ${ANIMATION_CONFIG.SECTION_HEIGHT}vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
`;

// ScrollTrig Component
const ScrollTrig = forwardRef(({ children }, ref) => {
  const { mainTimeline, objectTimeline } = useTimeline();
  const contentRef = useRef(null);
  const sectionRefs = useRef([]);
  const [totalHeight, setTotalHeight] = useState(0);

  useImperativeHandle(ref, () => ({
    getSectionRefs: () => sectionRefs.current,
    getContentRef: () => contentRef.current,
  }));

  const createSectionTrigger = useCallback(
    (section, totalScrollHeight) => {
      const sectionHeight = window.innerHeight;
      const isAnimated = section.dataset.animated === "true";
      if (isAnimated) {
        const animatedSectionHeight =
          sectionHeight * (1 + ANIMATION_CONFIG.DURATION);
        totalScrollHeight += animatedSectionHeight;

        if (mainTimeline) {
          ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: `+=${animatedSectionHeight}px`,
            pin: true,
            scrub: true,
            markers: true,
            animation: mainTimeline,
          });
        }

        if (objectTimeline) {
          ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: `+=${animatedSectionHeight}px`,
            scrub: true,
            markers: false,
            animation: objectTimeline,
          });
        }
      } else {
        totalScrollHeight += sectionHeight;
        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "bottom top",
          pin: false,
          pinSpacing: false,
          markers: true,
        });
      }
      return totalScrollHeight;
    },
    [mainTimeline, objectTimeline]
  );

  useEffect(() => {
    const sections = sectionRefs.current;
    let totalScrollHeight = 0;

    sections.forEach((section) => {
      totalScrollHeight = createSectionTrigger(section, totalScrollHeight);
    });
    setTotalHeight(totalScrollHeight);

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [createSectionTrigger]);

  return (
    <ContentDiv ref={contentRef} height={totalHeight}>
      {React.Children.map(children, (child, index) => (
        <SectionDiv
          ref={(el) => (sectionRefs.current[index] = el)}
          key={index}
          className={`scrollTrigger-${index} section`}
          data-animated={child.props.animated ? "true" : "false"}
          aria-label={`Section ${index + 1}`}
        >
          {child}
        </SectionDiv>
      ))}
    </ContentDiv>
  );
});

// TimelineSection Component
const TimelineSection = () => {
  const { mainTimeline } = useTimeline();
  const elementRef = useRef(null);

  useEffect(() => {
    if (!mainTimeline) {
      console.error("Timeline is not provided");
      return;
    }

    mainTimeline.to(elementRef.current, {
      rotation: ANIMATION_CONFIG.ROTATION_ANGLE,
      scale: ANIMATION_CONFIG.SCALE_FACTOR,
      duration: ANIMATION_CONFIG.DURATION,
    });
  }, [mainTimeline]);

  return (
    <div>
      Section 1
      <div
        ref={elementRef}
        className="animate-me"
        style={{ width: "100px", height: "100px", background: "red" }}
        aria-label="Animated element"
      >
        Animate Me
      </div>
    </div>
  );
};

// Obj Component
const Obj = () => {
  const { objectTimeline } = useTimeline();
  const scrollTriggerRef = useScrollTrigger();
  const animFirst = useRef(ANIMATION_INITIAL.FIRST);
  const animSecondary = useRef(ANIMATION_INITIAL.SECONDARY);

  useEffect(() => {
    if (!objectTimeline) {
      console.error("objectTimeline is not available");
      return;
    }

    if (scrollTriggerRef && scrollTriggerRef.current) {
      const sectionRefs = scrollTriggerRef.current.getSectionRefs();

      const tl1 = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRefs[0],
          start: "top top",
          endTrigger: sectionRefs[1],
          end: "bottom bottom",
          scrub: 1,
        },
      });
      tl1.to(animFirst.current, ANIMATION_STAGES.STAGE_1);

      const tl3 = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRefs[1],
          start: "top top",
          endTrigger: sectionRefs[2],
          end: "bottom bottom",
          scrub: 1,
        },
      });
      tl3.to(animSecondary.current, ANIMATION_STAGES.STAGE_2);

      const tl2 = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRefs[2],
          start: "top top",
          endTrigger: sectionRefs[4],
          end: "bottom bottom",
          scrub: 1,
        },
      });
      tl2.to(animFirst.current, ANIMATION_STAGES.STAGE_3);

      objectTimeline.add(tl1, 0).add(tl3, 0).add(tl2, 0);
    }
  }, [scrollTriggerRef, objectTimeline]);

  return (
    <Item animFirst={animFirst.current} animSecondary={animSecondary.current} />
  );
};

// Item Component
function Item({ animFirst, animSecondary }) {
  const animFirstRef = useRef();
  const animSecondaryRef = useRef();

  useFrame(() => {
    if (animFirstRef.current && animSecondaryRef.current) {
      animFirstRef.current.position.x = -2 * animFirst.x;
      animFirstRef.current.rotation.y = -1.5 * animFirst.y;
      animFirstRef.current.position.y = -1.5 * animFirst.y;
      animSecondaryRef.current.position.y = -1.5 * animSecondary.y;
    }
  });

  return (
    <group>
      <mesh castShadow ref={animFirstRef} position={[0, 0, 0]}>
        <torusGeometry attach="geometry" args={[2, 0.5, 32, 128]} />
        <meshPhongMaterial
          color="red"
          opacity={1}
          shininess={1000}
          metalness={0.2}
        />
      </mesh>
      <mesh castShadow ref={animSecondaryRef} position={[0, 0, 0]}>
        <sphereGeometry attach="geometry" args={[1, 16, 32]} />
        <meshPhysicalMaterial
          specular={["yellow"]}
          shininess={1000}
          metalness={0.2}
          roughness={0}
          clearcoat={0.8}
        />
      </mesh>
    </group>
  );
}

const DomAnimationSection = () => {
  const { objectTimeline } = useTimeline();
  const scrollTriggerRef = useScrollTrigger();
  const boxRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    if (!objectTimeline || !scrollTriggerRef || !scrollTriggerRef.current) {
      console.error("Required elements for animation are missing");
      return;
    }

    console.log("Setting up DomAnimationSection timeline");

    const sectionRefs = scrollTriggerRef.current.getSectionRefs();

    gsap.to(boxRef.current, {
      ...DOM_ANIMATION_STAGES.STAGE_1,
      scrollTrigger: {
        trigger: sectionRefs[0],
        start: "top top",
        end: "bottom top",
        scrub: 1,
        markers: true,
      },
    });

    gsap.to(textRef.current, {
      ...DOM_ANIMATION_STAGES.STAGE_2,
      scrollTrigger: {
        trigger: sectionRefs[1],
        start: "top top",
        end: "bottom top",
        scrub: 1,
        markers: true,
      },
    });

    gsap.to(boxRef.current, {
      ...DOM_ANIMATION_STAGES.STAGE_3,
      scrollTrigger: {
        trigger: sectionRefs[2],
        start: "top top",
        end: "bottom top",
        scrub: 1,
        markers: true,
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [objectTimeline, scrollTriggerRef]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      <div
        ref={boxRef}
        style={{
          width: 100,
          height: 100,
          backgroundColor: "blue",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      ></div>
      <h2
        ref={textRef}
        style={{
          position: "absolute",
          top: "70%",
          left: "50%",
          transform: "translateX(-50%)",
          color: "black",
          textShadow: "2px 2px 4px rgba(255,255,255,0.5)",
        }}
      >
        Animated DOM Section
      </h2>
    </div>
  );
};

// Light Component
const Light = () => (
  <directionalLight
    castShadow
    position={[0, 10, 20]}
    intensity={0.9}
    shadow-mapSize-width={1024}
    shadow-mapSize-height={1024}
    shadow-camera-far={50}
    shadow-camera-left={-10}
    shadow-camera-right={10}
    shadow-camera-top={10}
    shadow-camera-bottom={-10}
  />
);

// OtherComponent
const OtherComponent = () => (
  <>
    <Light />
    <Obj />
  </>
);

// MainApp Component
const MainApp = () => {
  const scrollTriggerRef = useRef();
  const [timelines, setTimelines] = useState({
    mainTimeline: null,
    objectTimeline: null,
  });

  useEffect(() => {
    setTimelines({
      mainTimeline: gsap.timeline(),
      objectTimeline: gsap.timeline(),
    });
  }, []);

  return (
    <ScrollTriggerContext.Provider value={scrollTriggerRef}>
      <TimelineContext.Provider value={timelines}>
        <CanvasContainer>
          <Canvas
            shadows
            camera={{ position: [0, 0, 10] }}
            gl={{ antialias: false }}
          >
            <ScrollControls pages={4} damping={2}>
              <Scroll>
                <OtherComponent />
              </Scroll>
            </ScrollControls>
          </Canvas>
        </CanvasContainer>
        <DomAnimationSection />
        <ScrollContent>
          <ScrollTrig ref={scrollTriggerRef}>
            <div>Section 0</div>
            <TimelineSection animated />
            <div>Section 2</div>
            <div>Section 3</div>
          </ScrollTrig>
        </ScrollContent>
      </TimelineContext.Provider>
    </ScrollTriggerContext.Provider>
  );
};

export default MainApp;
