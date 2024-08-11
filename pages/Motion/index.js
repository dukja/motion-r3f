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
import { debounce } from "lodash";

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
export const useFloatingAnimation = (ref, options = {}) => {
  const { yOffset = 10, duration = 1, ease = "power1.inOut" } = options;

  const startFloating = useCallback(() => {
    if (!ref.current) return;
    gsap.to(ref.current, {
      y: `-=${yOffset}`,
      duration,
      repeat: -1,
      yoyo: true,
      ease,
    });
  }, [ref, yOffset, duration, ease]);

  const stopFloating = useCallback(() => {
    if (!ref.current) return;
    gsap.killTweensOf(ref.current);
    gsap.to(ref.current, { y: 0, duration: 0.3 });
  }, [ref]);

  useEffect(() => {
    startFloating();
    return () => {
      stopFloating();
    };
  }, [startFloating, stopFloating]);

  return { startFloating, stopFloating };
};
export const FloatingElement = ({
  children,
  scrollTrigger,
  animationStages,
  style,
  ...props
}) => {
  const elementRef = useRef(null);
  const { startFloating, stopFloating } = useFloatingAnimation(elementRef);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    if (!scrollTrigger || !animationStages) return;

    const { trigger, start, end } = scrollTrigger;

    const scrollHandler = debounce(() => {
      setIsScrolling(false);
      startFloating();
    }, 150); // 스크롤이 150ms 동안 멈추면 둥둥 효과 시작

    window.addEventListener("scroll", () => {
      setIsScrolling(true);
      stopFloating();
      scrollHandler();
    });

    Object.entries(animationStages).forEach(([stage, animation], index) => {
      gsap.to(elementRef.current, {
        ...animation,
        scrollTrigger: {
          trigger,
          start: index === 0 ? start : `${start} +=${index * 100}%`,
          end:
            index === animationStages.length - 1
              ? end
              : `${start} +=${(index + 1) * 100}%`,
          scrub: 1,
          markers: true,
          onEnter: stopFloating,
          onLeaveBack: startFloating,
          onLeave:
            index === animationStages.length - 1 ? startFloating : undefined,
        },
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      window.removeEventListener("scroll", scrollHandler);
    };
  }, [scrollTrigger, animationStages, startFloating, stopFloating]);

  return (
    <div ref={elementRef} style={style} {...props}>
      {children}
    </div>
  );
};

const SectionContainer = styled.div`
  height: 100vh;
  width: 100vw;
  background-color: black;
  position: relative;
  overflow: hidden;
  z-index: -1;
`;

const PhotoBox = styled.div`
  height: 150px;
  width: 150px;
  position: absolute;
  background-size: cover;
  background-position: center;
  border-radius: 10px;
`;
const PHOTO_ANIMATION = {
  FLOAT_DISTANCE: 30,
  FLOAT_DURATION_MIN: 2,
  FLOAT_DURATION_MAX: 3,
  SCROLL_SPEED_MULTIPLIER: 1.5, // 기본 스크롤 속도보다 1.5배 빠름
  SCROLL_SCRUB: 0.5,
};

export const PhotoSection = () => {
  const sectionRef = useRef(null);
  const photoRefs = useRef([]);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const photoUrls = [
      "https://picsum.photos/150/150?random=1",
      "https://picsum.photos/150/150?random=2",
      "https://picsum.photos/150/150?random=3",
      "https://picsum.photos/150/150?random=4",
      "https://picsum.photos/150/150?random=5",
      "https://picsum.photos/150/150?random=6",
    ];
    setPhotos(photoUrls);
  }, []);

  useEffect(() => {
    if (!sectionRef.current || photoRefs.current.length === 0) return;

    const randomPosition = () => ({
      x: Math.random() * (window.innerWidth - 150),
      y: Math.random() * window.innerHeight + window.innerHeight, // 시작 위치를 화면 아래로 설정
    });

    photoRefs.current.forEach((photo, index) => {
      if (!photo) return;

      const pos = randomPosition();
      gsap.set(photo, {
        x: pos.x,
        y: pos.y,
        opacity: 0, // 초기에 투명하게 설정
      });

      // 스크롤에 따른 이동 및 나타나는 애니메이션
      gsap.to(photo, {
        y: `-=${window.innerHeight * PHOTO_ANIMATION.SCROLL_SPEED_MULTIPLIER}`,
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: PHOTO_ANIMATION.SCROLL_SCRUB,
        },
      });

      // 둥둥 효과
      gsap.to(photo, {
        y: `+=${PHOTO_ANIMATION.FLOAT_DISTANCE}`,
        duration:
          PHOTO_ANIMATION.FLOAT_DURATION_MIN +
          Math.random() *
            (PHOTO_ANIMATION.FLOAT_DURATION_MAX -
              PHOTO_ANIMATION.FLOAT_DURATION_MIN),
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [photos]);

  return (
    <SectionContainer ref={sectionRef} className="photo-section">
      <h2
        style={{
          color: "white",
          textAlign: "center",
          paddingTop: "20px",
          position: "sticky",
          top: "20px",
        }}
      >
        Photo Section
      </h2>
      {photos.map((url, index) => (
        <PhotoBox
          key={index}
          ref={(el) => (photoRefs.current[index] = el)}
          style={{
            backgroundImage: `url(${url})`,
          }}
        />
      ))}
    </SectionContainer>
  );
};

export const ScrollTrig = forwardRef(({ children }, ref) => {
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
      const isPhotoSection = section.classList.contains("photo-section");

      if (isPhotoSection) {
        // PhotoSection에 대한 특별한 처리
        totalScrollHeight += sectionHeight;
        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "bottom top",
          pin: false,
          scrub: true,
          markers: true,
        });
      } else if (isAnimated) {
        // 기존의 애니메이션 섹션 처리
        // ...
      } else {
        // 기존의 일반 섹션 처리
        // ...
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

export const TimelineSection = () => {
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

export const Obj = () => {
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

export const Item = ({ animFirst, animSecondary }) => {
  const animFirstRef = useRef();
  const animSecondaryRef = useRef();
  const time = useRef(0);

  useFrame((state, delta) => {
    if (animFirstRef.current && animSecondaryRef.current) {
      // 기존 애니메이션 로직
      animFirstRef.current.position.x = -2 * animFirst.x;
      animFirstRef.current.rotation.y = -1.5 * animFirst.y;
      animFirstRef.current.position.y = -1.5 * animFirst.y;
      animSecondaryRef.current.position.y = -1.5 * animSecondary.y;

      // 둥둥 효과 추가
      time.current += delta;
      const floatY = Math.sin(time.current) * 0.2; // 0.1은 움직임의 크기를 조절합니다

      animFirstRef.current.position.y += floatY;
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
};
export const DomAnimationSection = () => {
  const scrollTriggerRef = useScrollTrigger();

  const animationStages = [
    DOM_ANIMATION_STAGES.STAGE_1,
    DOM_ANIMATION_STAGES.STAGE_2,
    DOM_ANIMATION_STAGES.STAGE_3,
  ];

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
      <FloatingElement
        scrollTrigger={{
          trigger: scrollTriggerRef?.current?.getSectionRefs()[0],
          start: "top top",
          end: "bottom top",
        }}
        animationStages={animationStages}
        style={{
          width: 100,
          height: 100,
          backgroundColor: "blue",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
      <h2
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

export const Light = () => (
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

export const OtherComponent = () => (
  <>
    <Light />
    <Obj />
  </>
);

const MainApp = () => {
  const scrollTriggerRef = useRef();
  const [timelines, setTimelines] = useState({
    mainTimeline: null,
    objectTimeline: null,
  });

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    setTimelines({
      mainTimeline: gsap.timeline(),
      objectTimeline: gsap.timeline(),
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
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
            <PhotoSection />
            <div>Section 4</div>
          </ScrollTrig>
        </ScrollContent>
      </TimelineContext.Provider>
    </ScrollTriggerContext.Provider>
  );
};
export default MainApp;
