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
import { Scroll, ScrollControls, useGLTF } from "@react-three/drei";
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
const PHOTO_ANIMATION = {
  FLOAT_DISTANCE: 10,
  FLOAT_DURATION_MIN: 2,
  FLOAT_DURATION_MAX: 3,
  SCROLL_SPEED_MULTIPLIER: 0.3,
  SCROLL_SCRUB: 1,
  POSITION_VARIATION: 10, // 위치 변화 폭
  SIZE_VARIATION: 50, // 크기 변화 폭
  BASE_SIZE: 200, // 기본 크기
  POSITION_BASE: 20, // 기본 위치
};

const SectionContainer = styled.div`
  height: 100vh;
  width: 100vw;
  background-color: black;
  position: relative;
  overflow: hidden;
`;

const PhotoBox = styled.div`
  height: 150px;
  width: 150px;
  position: absolute;
  background-size: cover;
  background-position: center;
  border-radius: 10px;
`;

const Title = styled.h2`
  color: white;
  text-align: center;
  padding-top: 20px;
  position: sticky;
  top: 20px;
`;

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

export const useFloatingAnimation = () => {
  const startFloating = useCallback((element, options = {}) => {
    const { yOffset = 10, duration = 2, ease = "sine.inOut" } = options;

    if (!element) return;

    const floatingTween = gsap.to(element, {
      y: `+=${yOffset}`,
      duration,
      repeat: -1,
      yoyo: true,
      ease,
    });

    return () => {
      floatingTween.kill();
    };
  }, []);

  const stopFloating = useCallback((element) => {
    if (!element) return;
    gsap.killTweensOf(element);
    gsap.to(element, { y: 0, duration: 0.3 });
  }, []);

  return { startFloating, stopFloating };
};

const generatePositions = (numPhotos) => {
  const positions = [];
  const numRows = Math.ceil(Math.sqrt(numPhotos));
  const numCols = Math.ceil(numPhotos / numRows);

  const sizeRatios = [
    { width: 1, height: 1 },
    { width: 1, height: 1.5 },
    { width: 1.5, height: 1 },
  ];

  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      if (positions.length < numPhotos) {
        const ratio = sizeRatios[Math.floor(Math.random() * sizeRatios.length)];
        const baseSize = PHOTO_ANIMATION.BASE_SIZE;
        positions.push({
          x: `${
            (col + 1) * (100 / (numCols + 1)) +
            (Math.random() * PHOTO_ANIMATION.POSITION_VARIATION -
              PHOTO_ANIMATION.POSITION_VARIATION / 2)
          }%`,
          y: `${
            (row + 1) * (100 / (numRows + 1)) +
            (Math.random() * PHOTO_ANIMATION.POSITION_VARIATION -
              PHOTO_ANIMATION.POSITION_VARIATION / 2)
          }%`,
          width: `${
            Math.random() * PHOTO_ANIMATION.SIZE_VARIATION +
            baseSize * ratio.width
          }px`,
          height: `${
            Math.random() * PHOTO_ANIMATION.SIZE_VARIATION +
            baseSize * ratio.height
          }px`,
        });
      }
    }
  }

  return positions;
};

export const FloatingElement = ({
  children,
  scrollTrigger,
  animationStages,
  style,
  ...props
}) => {
  const elementRef = useRef(null);
  const { startFloating, stopFloating } = useFloatingAnimation();

  useEffect(() => {
    if (!elementRef.current) return;

    startFloating(elementRef.current, {
      yOffset: 20,
      duration: 2,
      ease: "sine.inOut",
    });

    if (!scrollTrigger || !animationStages) return;

    const { trigger, start, end } = scrollTrigger;

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
          onEnter: () => stopFloating(elementRef.current),
          onLeaveBack: () => startFloating(elementRef.current),
          onLeave:
            index === animationStages.length - 1
              ? () => startFloating(elementRef.current)
              : undefined,
        },
      });
    });

    return () => {
      stopFloating(elementRef.current);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [scrollTrigger, animationStages, startFloating, stopFloating]);

  return (
    <div ref={elementRef} style={style} {...props}>
      {children}
    </div>
  );
};

export const PhotoSection = () => {
  const sectionRef = useRef(null);
  const photoRefs = useRef([]);
  const [photos, setPhotos] = useState([]);
  const [positions, setPositions] = useState([]);
  const scrollTriggerRef = useScrollTrigger();

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
    const numPhotos = photoUrls.length;
    setPositions(generatePositions(numPhotos));
  }, []);

  useEffect(() => {
    if (!scrollTriggerRef || photoRefs.current.length === 0) return;

    const sectionRefs = scrollTriggerRef.current.getSectionRefs();

    photoRefs.current.forEach((photo, index) => {
      if (!photo) return;

      const pos = positions[index];
      gsap.set(photo, {
        top: pos.x,
        left: pos.y,
        width: pos.size,
        height: pos.size,
        opacity: 0.1,
      });

      gsap.to(photo, {
        y: `-=${window.innerHeight * PHOTO_ANIMATION.SCROLL_SPEED_MULTIPLIER}`,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRefs[3],
          start: "top bottom",
          end: "bottom top",
          scrub: PHOTO_ANIMATION.SCROLL_SCRUB,
          onUpdate: (self) => {
            // 현재 스크롤 진행도를 기반으로 예상 위치 설정
            const progress = self.progress;
            const yMove =
              -window.innerHeight *
              PHOTO_ANIMATION.SCROLL_SPEED_MULTIPLIER *
              progress;
            gsap.to(photo, { y: yMove, overwrite: "auto" });
          },
          // onEnter: () => gsap.to(photo, { opacity: 1, duration: 0.7 }),
          onToggle: (self) => {
            if (self.isActive) {
              gsap.to(photo, { opacity: 1, duration: 1 });
            } else {
              gsap.to(photo, { opacity: 0.3, duration: 1 });
            }
          },
        },
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [photos, scrollTriggerRef]);

  return (
    <SectionContainer ref={sectionRef}>
      <Title>Photo Section</Title>
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
  const ribbonRef = useRef();
  const time = useRef(0);
  const { startFloating, stopFloating } = useFloatingAnimation();
  const { scene } = useGLTF("/3D/ribbon.glb");
  useEffect(() => {
    if (!animFirstRef.current) return;

    const cleanup = startFloating(animFirstRef.current, {
      yOffset: 20,
      duration: 2,
      ease: "sine.inOut",
      scrollSpeed: 1.2,
    });

    return () => {
      cleanup();
      stopFloating(animFirstRef.current);
    };
  }, [startFloating, stopFloating]);

  useFrame((state, delta) => {
    if (animFirstRef.current && ribbonRef.current) {
      // 기존 애니메이션 로직
      animFirstRef.current.position.x = -2 * animFirst.x;
      animFirstRef.current.rotation.y = -1.5 * animFirst.y;
      animFirstRef.current.position.y = -1.5 * animFirst.y;
      ribbonRef.current.position.y = -1.5 * animSecondary.y;

      // 둥둥 효과 추가
      time.current += delta;
      const floatY = Math.sin(time.current) * 0.1;

      animFirstRef.current.position.y += floatY;
      ribbonRef.current.position.y += floatY;
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
      <primitive
        ref={ribbonRef}
        object={scene}
        scale={1}
        position={[0, 0, 0]}
      />
    </group>
  );
};

export const DomAnimationSection = () => {
  const { startFloating, stopFloating } = useFloatingAnimation();
  const elementRef = useRef(null);
  const textRef = useRef(null);
  const scrollTriggerRef = useContext(ScrollTriggerContext);
  const { objectTimeline } = useContext(TimelineContext);

  useEffect(() => {
    if (!scrollTriggerRef || !objectTimeline) return;

    const sectionRefs = scrollTriggerRef.current.getSectionRefs();

    objectTimeline.clear();

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
    tl1
      .to(textRef.current, {
        xPercent: 0,
      })
      .to(textRef.current, {
        xPercent: 100,
      });

    const tl2 = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRefs[1],
        start: "top top",
        endTrigger: sectionRefs[2],
        end: "bottom bottom",
        markers: true,
        scrub: 1,
      },
    });
    tl2.to(elementRef.current, {
      width: 100,
      height: 100,
      x: "+=300",
    });

    objectTimeline.add(tl1).add(tl2);
  }, [scrollTriggerRef, objectTimeline]);

  useEffect(() => {
    if (!elementRef.current) return;

    const cleanup = startFloating(elementRef.current, {
      yOffset: 20,
      duration: 2,
      ease: "sine.inOut",
      scrollSpeed: 1.2,
    });

    return () => {
      cleanup();
      stopFloating(elementRef.current);
    };
  }, [startFloating, stopFloating]);

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
        ref={elementRef}
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
