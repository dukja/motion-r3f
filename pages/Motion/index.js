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
  STAGE_1: { xPercent: 0, duration: 1 },
  STAGE_2: { xPercent: 100, duration: 1 },
  STAGE_3: { width: 100, height: 100, x: "+=300", duration: 1 },
};
const PHOTO_ANIMATION = {
  FLOAT_DISTANCE: 10, // 사진이 위아래로 움직이는 최대 거리 (픽셀)
  FLOAT_DURATION_MIN: 2, // 사진이 위아래로 움직이는 최소 시간 (초)
  FLOAT_DURATION_MAX: 3, // 사진이 위아래로 움직이는 최대 시간 (초)
  SCROLL_SPEED_MULTIPLIER: 0.3, // 스크롤 속도에 대한 사진 이동 속도의 배수
  SCROLL_SCRUB: 1, // 스크롤 애니메이션의 부드러움 정도 (1은 즉시 반응)
  ASPECT_RATIO: 1.3, // 사진의 높이/너비 비율
  OPACITY_DURATION: 0.2, // 투명도 변화 지속 시간 (초)
  OVERLAP_THRESHOLD: 20, // 사진이 겹칠 수 있는 최대 픽셀
  OPACITY_LOW: 0.3, // 사진의 최소 투명도
  OPACITY_HIGH: 1, // 사진의 최대 투명도
  POSITION_VARIATION: 10, // 사진 위치의 무작위성 정도 (퍼센트)
  MIN_WIDTH: 150, // 사진의 최소 너비 (픽셀)
  MAX_WIDTH: 300, // 사진의 최대 너비 (픽셀)
};

const SectionContainer = styled.div`
  height: 100vh;
  width: 100vw;
  background-color: black;
  position: relative;
  overflow: hidden;
`;

const PhotoBox = styled.div`
  position: absolute;
  background-size: cover;
  background-position: center;
  border-radius: 10px;
  transition: opacity 0.3s ease, box-shadow 0.3s ease;
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
  const time = useRef(0);

  const startFloating = useCallback((element, options = {}) => {
    const {
      yOffset = 10,
      duration = 2,
      ease = "sine.inOut",
      amplitude = 0.1,
      frequency = 1,
      is3D = false,
    } = options;

    if (!element) return;

    if (is3D) {
      // 3D 객체에 대한 애니메이션 함수 반환
      return (delta) => {
        time.current += delta;
        const floatY = Math.sin(time.current * frequency) * amplitude;
        element.position.y += floatY;
      };
    } else {
      // DOM 요소에 대한 애니메이션
      const floatingTween = gsap.to(element, {
        y: `+=${yOffset}`,
        duration,
        repeat: -1,
        yoyo: true,
        ease,
      });

      return () => floatingTween.kill();
    }
  }, []);

  const stopFloating = useCallback((element, is3D = false) => {
    if (!element) return;

    if (is3D) {
      // 3D 객체의 애니메이션 중지
      element.position.y = 0;
    } else {
      // DOM 요소의 애니메이션 중지
      gsap.killTweensOf(element);
      gsap.to(element, { y: 0, duration: 0.3 });
    }
  }, []);

  return { startFloating, stopFloating };
};
export const generatePositions = (photos, numPhotos) => {
  let photoArray = Array.isArray(photos)
    ? photos
    : typeof photos === "object" && photos !== null
    ? Object.values(photos)
    : [];

  while (photoArray.length < numPhotos) {
    photoArray.push({});
  }

  const positions = [];
  const numRows = Math.ceil(Math.sqrt(numPhotos));
  const numCols = Math.ceil(numPhotos / numRows);

  const checkOverlap = (newPos, existingPositions) => {
    for (let pos of existingPositions) {
      const xOverlap =
        Math.abs(parseFloat(newPos.left) - parseFloat(pos.left)) <
        PHOTO_ANIMATION.OVERLAP_THRESHOLD_HORIZONTAL;
      const yOverlap =
        Math.abs(parseFloat(newPos.top) - parseFloat(pos.top)) <
        PHOTO_ANIMATION.OVERLAP_THRESHOLD_VERTICAL;
      if (xOverlap && yOverlap) return true;
    }
    return false;
  };

  photoArray.forEach((photo, index) => {
    if (index >= numPhotos) return;

    const row = Math.floor(index / numCols);
    const col = index % numCols;

    let newPosition;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      attempts++;
      newPosition = { ...photo };

      if (!newPosition.width) {
        const width =
          Math.random() *
            (PHOTO_ANIMATION.MAX_WIDTH - PHOTO_ANIMATION.MIN_WIDTH) +
          PHOTO_ANIMATION.MIN_WIDTH;
        newPosition.width = `${width}px`;

        if (!newPosition.height) {
          const height = width * PHOTO_ANIMATION.ASPECT_RATIO;
          newPosition.height = `${height}px`;
        }
      } else if (!newPosition.height) {
        const width = parseInt(newPosition.width);
        const height = width * PHOTO_ANIMATION.ASPECT_RATIO;
        newPosition.height = `${height}px`;
      }

      if (!newPosition.top) {
        const centerY = (row + 0.5) * (100 / numRows);
        const variation =
          (Math.random() - 0.5) * PHOTO_ANIMATION.POSITION_VARIATION;
        newPosition.top = `${centerY + variation}%`;
      }

      if (!newPosition.left) {
        const centerX = (col + 0.5) * (100 / numCols);
        const variation =
          (Math.random() - 0.5) * PHOTO_ANIMATION.POSITION_VARIATION;
        newPosition.left = `${centerX + variation}%`;
      }

      if (!newPosition.url) {
        newPosition.url = `https://picsum.photos/300/390?random=${index + 1}`;
      }

      if (attempts >= maxAttempts) {
        console.warn(
          `Failed to find non-overlapping position for photo ${index} after ${maxAttempts} attempts`
        );
        break;
      }
    } while (checkOverlap(newPosition, positions));

    positions.push(newPosition);
  });

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
  const scrollTriggerRef = useScrollTrigger();

  useEffect(() => {
    const initialPhotos = [
      { url: "https://picsum.photos/300/390?random=1" },
      {
        url: "https://picsum.photos/300/390?random=2",
        top: "30%",
        left: "40%",
      },
      { url: "https://picsum.photos/300/390?random=3", width: "200px" },
      { url: "https://picsum.photos/300/390?random=4", height: "250px" },
      { url: "https://picsum.photos/300/390?random=5" },
      {
        url: "https://picsum.photos/300/390?random=6",
        top: "70%",
        left: "60%",
      },
    ];
    const totalPhotos = 10;

    const positionedPhotos = generatePositions(initialPhotos, totalPhotos);
    setPhotos(positionedPhotos);
  }, []);

  useEffect(() => {
    if (
      !scrollTriggerRef ||
      photoRefs.current.length === 0 ||
      photos.length === 0
    )
      return;

    const sectionRefs = scrollTriggerRef.current.getSectionRefs();

    photoRefs.current.forEach((photo, index) => {
      if (!photo) return;

      const pos = photos[index];
      gsap.set(photo, {
        top: pos.top,
        left: pos.left,
        width: pos.width,
        height: pos.height,
        opacity: PHOTO_ANIMATION.OPACITY_LOW,
        boxShadow: "none",
      });

      let direction = 1; // 1 for downward, -1 for upward

      ScrollTrigger.create({
        trigger: sectionRefs[3],
        start: "top center",
        end: "bottom center",
        onEnter: () => {
          if (direction === 1) {
            gsap.to(photo, {
              opacity: PHOTO_ANIMATION.OPACITY_HIGH,
              duration: 0.3,
              overwrite: "auto",
            });
          }
        },
        onEnterBack: () => {
          // Do nothing when scrolling back up into the section
        },
        onLeave: () => {
          direction = -1;
        },
        onLeaveBack: () => {
          direction = 1;
          gsap.to(photo, {
            opacity: PHOTO_ANIMATION.OPACITY_LOW,
            duration: 0.3,
            overwrite: "auto",
          });
        },
      });

      gsap.to(photo, {
        y: `-=${window.innerHeight * PHOTO_ANIMATION.SCROLL_SPEED_MULTIPLIER}`,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRefs[3],
          start: "top bottom",
          end: "bottom top",
          scrub: PHOTO_ANIMATION.SCROLL_SCRUB,
        },
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [scrollTriggerRef, photos]);

  return (
    <SectionContainer ref={sectionRef}>
      <Title>Photo Section</Title>
      {photos.map((photo, index) => (
        <PhotoBox
          key={index}
          ref={(el) => (photoRefs.current[index] = el)}
          style={{
            backgroundImage: `url(${photo.url})`,
            width: photo.width,
            height: photo.height,
            top: photo.top,
            left: photo.left,
            zIndex: index,
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
  const animateFirstRef = useRef();
  const animateRibbonRef = useRef();
  const { scene } = useGLTF("/3D/ribbon.glb");
  const { startFloating, stopFloating } = useFloatingAnimation();

  useEffect(() => {
    if (!animFirstRef.current || !ribbonRef.current) return;

    animateFirstRef.current = startFloating(animFirstRef.current, {
      amplitude: 0.1,
      frequency: 1,
      is3D: true,
    });
    animateRibbonRef.current = startFloating(ribbonRef.current, {
      amplitude: 0.1,
      frequency: 1,
      is3D: true,
    });

    return () => {
      stopFloating(animFirstRef.current, true);
      stopFloating(ribbonRef.current, true);
    };
  }, [startFloating, stopFloating]);

  useFrame((state, delta) => {
    if (animFirstRef.current && ribbonRef.current) {
      animFirstRef.current.position.x = -2 * animFirst.x;
      animFirstRef.current.rotation.y = -1.5 * animFirst.y;
      animFirstRef.current.position.y = -1.5 * animFirst.y;
      ribbonRef.current.position.y = -1.5 * animSecondary.y;

      // 여기서 반환된 애니메이션 함수 실행
      if (animateFirstRef.current) animateFirstRef.current(delta);
      if (animateRibbonRef.current) animateRibbonRef.current(delta);
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
        scrub: 1,
      },
    });
    tl1
      .to(textRef.current, DOM_ANIMATION_STAGES.STAGE_1)
      .to(textRef.current, DOM_ANIMATION_STAGES.STAGE_2);

    const tl2 = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRefs[1],
        start: "top top",
        endTrigger: sectionRefs[2],
        end: "bottom bottom",
        scrub: 1,
      },
    });
    tl2.to(elementRef.current, DOM_ANIMATION_STAGES.STAGE_3);

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
