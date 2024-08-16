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
  memo,
} from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
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

export const DOM_ANIMATION_STAGES = {
  STAGE_1: {
    xPercent: 0,
    duration: 1,
    ease: "power2.inOut",
  },
  STAGE_2: {
    xPercent: 100,
    duration: 1,
    ease: "power2.inOut",
  },
  STAGE_3: {
    width: 100,
    height: 100,
    x: "+=300",
    duration: 1,
    ease: "elastic.out(1, 0.3)",
  },
};
const PHOTO_ANIMATION = {
  FLOAT_DISTANCE: 10, // 사진이 위아래로 움직이는 최대 거리 (픽셀)
  FLOAT_DURATION_MIN: 2, // 사진이 위아래로 움직이는 최소 시간 (초)
  FLOAT_DURATION_MAX: 3, // 사진이 위아래로 움직이는 최대 시간 (초)
  SCROLL_SPEED_MULTIPLIER: 0.3, // 스크롤 속도에 대한 사진 이동 속도의 배수
  SCROLL_SCRUB: 1, // 스크롤 애니메이션의 부드러움 정도 (1은 즉시 반응)
  ASPECT_RATIO: 1.3, // 사진의 높이/너비 비율
  OPACITY_DURATION: 0.2, // 투명도 변화 지속 시간 (초)
  OVERLAP_THRESHOLD_MIN: 10, // 사진이 겹칠 수 있는 최소 픽셀
  OVERLAP_THRESHOLD_MAX: 30, // 사진이 겹칠 수 있는 최대 픽셀
  OPACITY_LOW: 0.3, // 사진의 최소 투명도
  OPACITY_HIGH: 1, // 사진의 최대 투명도
  POSITION_VARIATION: 10, // 사진 위치의 무작위성 정도 (퍼센트)
  MIN_WIDTH: 150, // 사진의 최소 너비 (픽셀)
  MAX_WIDTH: 300, // 사진의 최대 너비 (픽셀)
  POSITION_VARIATION_X: 20, // X축 변화 폭 증가
  POSITION_VARIATION_Y: 20, // Y축 변화 폭 증가
  POSITION_VARIATION_RANGE: 1, // 변화 범위 확대
  GRID_ROWS: 4, // 그리드 행 수
  GRID_COLS: 3, // 그리드 열 수
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
  mainTimeline: gsap.timeline(),
  objectTimeline: gsap.timeline(),
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

export const useFloatingAnimation = (options = {}) => {
  const {
    yOffset = 10,
    duration = 2,
    ease = "sine.inOut",
    is3D = false,
  } = options;

  const startFloating = useCallback(
    (element) => {
      if (!element) return null;

      if (is3D) {
        return (delta) => {
          element.position.y += Math.sin(Date.now() * 0.001) * yOffset * 0.1;
        };
      } else {
        return gsap.to(element, {
          y: `+=${yOffset}`,
          duration,
          repeat: -1,
          yoyo: true,
          ease,
        });
      }
    },
    [yOffset, duration, ease, is3D]
  );

  const stopFloating = useCallback((animation) => {
    if (animation && typeof animation.kill === "function") {
      animation.kill();
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
  const { GRID_ROWS, GRID_COLS, OVERLAP_THRESHOLD_MIN, OVERLAP_THRESHOLD_MAX } =
    PHOTO_ANIMATION;

  const getRandomOverlapThreshold = () =>
    Math.random() * (OVERLAP_THRESHOLD_MAX - OVERLAP_THRESHOLD_MIN) +
    OVERLAP_THRESHOLD_MIN;

  const checkOverlap = (newPos, existingPositions) => {
    for (let pos of existingPositions) {
      const overlapThreshold = getRandomOverlapThreshold();
      const xOverlap =
        Math.abs(parseFloat(newPos.left) - parseFloat(pos.left)) <
        overlapThreshold;
      const yOverlap =
        Math.abs(parseFloat(newPos.top) - parseFloat(pos.top)) <
        overlapThreshold;
      if (xOverlap && yOverlap) return true;
    }
    return false;
  };

  photoArray.forEach((photo, index) => {
    if (index >= numPhotos) return;

    const row = Math.floor(index / GRID_COLS);
    const col = index % GRID_COLS;

    let newPosition;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      attempts++;
      newPosition = { ...photo };

      const centerY = ((row + 0.5) / GRID_ROWS) * 100;
      const centerX = ((col + 0.5) / GRID_COLS) * 100;

      const xVariation =
        (Math.random() - 0.5) * PHOTO_ANIMATION.POSITION_VARIATION_X * 2;
      const yVariation =
        (Math.random() - 0.5) * PHOTO_ANIMATION.POSITION_VARIATION_Y * 2;

      newPosition.top = `${centerY + yVariation}%`;
      newPosition.left = `${centerX + xVariation}%`;

      if (!newPosition.width) {
        const width =
          Math.random() *
            (PHOTO_ANIMATION.MAX_WIDTH - PHOTO_ANIMATION.MIN_WIDTH) +
          PHOTO_ANIMATION.MIN_WIDTH;
        newPosition.width = `${width}px`;
        newPosition.height = `${width * PHOTO_ANIMATION.ASPECT_RATIO}px`;
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

const createAnimationTimeline = (timeline, trigger, stages) => {
  stages.forEach((stage, index) => {
    timeline.to(stage.target, stage.animation, index);
  });
  return timeline;
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

    const cleanup = startFloating(elementRef.current, {
      yOffset: 20,
      duration: 2,
      ease: "sine.inOut",
    });

    if (!scrollTrigger || !animationStages) return cleanup;

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
          onLeaveBack: () =>
            startFloating(elementRef.current, {
              yOffset: 20,
              duration: 2,
              ease: "sine.inOut",
            }),
          onLeave:
            index === animationStages.length - 1
              ? () =>
                  startFloating(elementRef.current, {
                    yOffset: 20,
                    duration: 2,
                    ease: "sine.inOut",
                  })
              : undefined,
        },
      });
    });

    return () => {
      cleanup();
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
          aria-label={`Photo ${index + 1}`}
          role="img"
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
  const [totalPages, setTotalPages] = useState(0);

  useImperativeHandle(ref, () => ({
    getSectionRefs: () => sectionRefs.current,
    getContentRef: () => contentRef.current,
    getTotalPages: () => totalPages,
  }));

  useEffect(() => {
    const sections = sectionRefs.current;
    let totalScrollHeight = 0;
    const triggers = [];

    sections.forEach((section, index) => {
      const sectionHeight = section.offsetHeight;
      totalScrollHeight += sectionHeight;

      if (index === 4) {
        // section5에 대한 특별한 처리
        const trigger = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: () => `+=${sectionHeight}`,
          scrub: 1,
          onUpdate: (self) => {
            const progress = self.progress;
            const {
              MEET_POINT_X,
              MEET_POINT_Y,
              ENTRY_DURATION,
              PAUSE_DURATION,
              EXIT_DURATION,
              CAMERA_DISTANCE,
              CAMERA_FOV,
            } = ANIMATION_SETTINGS;

            // 카메라 시야각을 고려한 뷰포트 크기 계산
            const vFov = (CAMERA_FOV * Math.PI) / 180;
            const viewportHeight = 2 * Math.tan(vFov / 2) * CAMERA_DISTANCE;
            const viewportWidth =
              viewportHeight * (window.innerWidth / window.innerHeight);

            const meetPointX = MEET_POINT_X * viewportWidth - viewportWidth / 2;
            const meetPointY =
              -MEET_POINT_Y * viewportHeight + viewportHeight / 2;

            let x, y, phase;
            if (progress < ENTRY_DURATION) {
              // 진입
              phase = "entry";
              x = gsap.utils.interpolate(
                viewportWidth / 2,
                meetPointX,
                progress / ENTRY_DURATION
              );
              y = gsap.utils.interpolate(
                viewportHeight / 2,
                meetPointY,
                progress / ENTRY_DURATION
              );
            } else if (progress < ENTRY_DURATION + PAUSE_DURATION) {
              // 정지
              phase = "pause";
              x = meetPointX;
              y = meetPointY;
            } else {
              // 퇴장
              phase = "exit";
              const exitProgress =
                (progress - ENTRY_DURATION - PAUSE_DURATION) / EXIT_DURATION;
              x = gsap.utils.interpolate(
                meetPointX,
                -viewportWidth / 2,
                exitProgress
              );
              y = meetPointY;
            }

            eventSystem.emit("updateElementPosition", {
              x,
              y,
              progress,
              phase,
            });
          },
        });
        triggers.push(trigger);
      }
    });

    setTotalHeight(totalScrollHeight);
    setTotalPages(sections.length);

    return () => {
      triggers.forEach((trigger) => trigger.kill());
    };
  }, []);
  const memoizedChildren = useMemo(
    () =>
      React.Children.map(children, (child, index) => (
        <SectionDiv
          ref={(el) => (sectionRefs.current[index] = el)}
          key={index}
          className={`scrollTrigger-${index} section`}
          data-animated={child.props.animated ? "true" : "false"}
          aria-label={`Section ${index + 1}`}
        >
          {child}
        </SectionDiv>
      )),
    [children]
  );

  return (
    <ContentDiv ref={contentRef} height={totalHeight}>
      {memoizedChildren}
    </ContentDiv>
  );
});
export const TimelineSection = memo(() => {
  const { mainTimeline } = useTimeline();
  const elementRef = useRef(null);

  useEffect(() => {
    if (!mainTimeline || !elementRef.current) {
      console.error("Timeline or element is not available");
      return;
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: elementRef.current,
        start: "top center",
        end: "bottom center",
        scrub: 1,
      },
    });

    tl.to(elementRef.current, {
      rotation: ANIMATION_CONFIG.ROTATION_ANGLE,
      scale: ANIMATION_CONFIG.SCALE_FACTOR,
      duration: ANIMATION_CONFIG.DURATION,
    });

    mainTimeline.add(tl, 0);

    return () => {
      tl.kill();
    };
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
});

export const Obj = memo(() => {
  const { objectTimeline } = useTimeline();
  const scrollTriggerRef = useScrollTrigger();
  const firstAnimationRef = useRef(ANIMATION_INITIAL.FIRST);
  const secondaryAnimationRef = useRef(ANIMATION_INITIAL.SECONDARY);

  useEffect(() => {
    if (!objectTimeline || !scrollTriggerRef?.current) return;

    const sectionRefs = scrollTriggerRef.current.getSectionRefs();

    const animationSequences = [
      {
        name: "firstSequence",
        trigger: sectionRefs[0],
        endTrigger: sectionRefs[1],
        target: firstAnimationRef.current,
        animation: ANIMATION_STAGES.STAGE_1,
      },
      {
        name: "secondSequence",
        trigger: sectionRefs[1],
        endTrigger: sectionRefs[2],
        target: secondaryAnimationRef.current,
        animation: ANIMATION_STAGES.STAGE_2,
      },
      {
        name: "thirdSequence",
        trigger: sectionRefs[2],
        endTrigger: sectionRefs[4],
        target: firstAnimationRef.current,
        animation: ANIMATION_STAGES.STAGE_3,
      },
    ];

    animationSequences.forEach(
      ({ name, trigger, endTrigger, target, animation }) => {
        const sequenceTimeline = gsap.timeline({
          scrollTrigger: {
            trigger,
            start: "top top",
            endTrigger,
            end: "bottom bottom",
            scrub: 1,
          },
        });
        sequenceTimeline.to(target, animation);
        objectTimeline.add(sequenceTimeline, 0, name);
      }
    );
  }, [scrollTriggerRef, objectTimeline]);

  return (
    <Item
      firstAnimation={firstAnimationRef.current || {}}
      secondaryAnimation={secondaryAnimationRef.current || {}}
    />
  );
});

export const Item = ({ firstAnimation, secondaryAnimation }) => {
  const animFirstRef = useRef();
  const ribbonRef = useRef();
  const { startFloating, stopFloating } = useFloatingAnimation();
  const { scene } = useGLTF("/3D/ribbon.glb", true);
  const time = useRef(0);

  useEffect(() => {
    if (!animFirstRef.current || !ribbonRef.current) return;

    const cleanupFirst = startFloating(animFirstRef.current, {
      amplitude: 0.1,
      frequency: 1,
      is3D: true,
    });
    const cleanupRibbon = startFloating(ribbonRef.current, {
      amplitude: 0.1,
      frequency: 1,
      is3D: true,
    });

    return () => {
      cleanupFirst();
      cleanupRibbon();
    };
  }, [startFloating]);

  useFrame((state, delta) => {
    time.current += delta;

    if (animFirstRef.current && ribbonRef.current) {
      // 안전하게 속성에 접근
      const firstX = firstAnimation?.x ?? 0;
      const firstY = firstAnimation?.y ?? 0;
      const secondaryY = secondaryAnimation?.y ?? 0;

      // 기존 애니메이션
      animFirstRef.current.position.x = -2 * firstX;
      animFirstRef.current.rotation.y = -1.5 * firstY;
      animFirstRef.current.position.y = -1.5 * firstY;
      ribbonRef.current.position.y = -1.5 * secondaryY;

      // 둥둥 떠다니는 효과 추가
      const floatOffsetTorus = Math.sin(time.current * 2) * 0.05;
      const floatOffsetRibbon = Math.sin(time.current * 1.5) * 0.05;

      animFirstRef.current.position.y += floatOffsetTorus;
      ribbonRef.current.position.y += floatOffsetRibbon;

      // 회전 효과 추가
      animFirstRef.current.rotation.y += delta * 0.2;
      ribbonRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group>
      <ThreeDElement />
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
const AnimatedElement = styled.div`
  width: 100px;
  height: 100px;
  background-color: blue;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const AnimatedText = styled.h2`
  position: absolute;
  top: 70%;
  left: 50%;
  transform: translateX(-50%);
  color: black;
  text-shadow: 2px 2px 4px rgba(255, 255, 255, 0.5);
`;

const DomAnimationSection = () => {
  const { startFloating, stopFloating } = useFloatingAnimation();
  const elementRef = useRef(null);
  const textRef = useRef(null);
  const scrollTriggerRef = useContext(ScrollTriggerContext);
  const { objectTimeline } = useContext(TimelineContext);

  const animateElement = useCallback(() => {
    if (!elementRef.current) return;

    const cleanup = startFloating(elementRef.current, {
      yOffset: 20,
      duration: 2,
      ease: "sine.inOut",
      scrollSpeed: 1.2,
    });

    return cleanup; // 이제 cleanup은 함수입니다
  }, [startFloating]);

  useEffect(() => {
    const cleanup = animateElement();
    return () => {
      if (typeof cleanup === "function") {
        cleanup();
      }
    };
  }, [animateElement]);

  useEffect(() => {
    if (!scrollTriggerRef || !objectTimeline) return;

    const sectionRefs = scrollTriggerRef.current.getSectionRefs();

    objectTimeline.clear();

    const stages = [
      {
        trigger: sectionRefs[0],
        animation: {
          scrollTrigger: {
            trigger: sectionRefs[0],
            start: "top top",
            endTrigger: sectionRefs[1],
            end: "bottom bottom",
            scrub: 1,
          },
          ...DOM_ANIMATION_STAGES.STAGE_1,
          ...DOM_ANIMATION_STAGES.STAGE_2,
        },
        target: textRef.current,
      },
      {
        trigger: sectionRefs[1],
        animation: {
          scrollTrigger: {
            trigger: sectionRefs[1],
            start: "top top",
            endTrigger: sectionRefs[2],
            end: "bottom bottom",
            scrub: 1,
          },
          ...DOM_ANIMATION_STAGES.STAGE_3,
        },
        target: elementRef.current,
      },
    ];

    stages.forEach((stage) => {
      const tl = gsap.timeline({
        scrollTrigger: stage.animation.scrollTrigger,
      });
      createAnimationTimeline(tl, stage.trigger, [stage]);
      objectTimeline.add(tl);
    });

    return () => {
      objectTimeline.clear();
      gsap.killTweensOf([textRef.current, elementRef.current]);
    };
  }, [scrollTriggerRef, objectTimeline]);

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
      <AnimatedElement ref={elementRef} aria-hidden="true" />
      <AnimatedText ref={textRef} aria-live="polite">
        Animated DOM Section
      </AnimatedText>
    </div>
  );
};

export const Light = () => (
  <>
    <ambientLight intensity={0.5} />
    <pointLight position={[10, 10, 10]} />
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
  </>
);

export const OtherComponent = () => (
  <>
    <Light />
    <Obj />
  </>
);

const ANIMATION_SETTINGS = {
  // 요소가 멈추는 화면 상의 x 위치 (화면 너비의 비율, 0~1)

  // 요소가 멈추는 화면 상의 y 위치 (화면 높이의 비율, 0~1)
  MEET_POINT_X: 0.3,
  MEET_POINT_Y: 0.3,
  ENTRY_DURATION: 0.3,
  PAUSE_DURATION: 0.4,
  EXIT_DURATION: 0.3,
  CAMERA_DISTANCE: 10,
  CAMERA_FOV: 75, // 카메라의 시야각 (degree)
  VIEWPORT_WIDTH: 5,
  VIEWPORT_HEIGHT: 5,
  Y_OFFSET: -100, // 픽셀 단위로 위로 이동
  // 요소가 MEET_POINT에 도달하는 데 걸리는 시간 (초)
  TIME_TO_MEET: 2,

  // 요소가 MEET_POINT에서 멈추는 시간 (초)

  // 요소가 MEET_POINT에서 화면을 벗어나는 데 걸리는 시간 (초)

  // 모바일과 데스크톱을 구분하는 화면 너비 (픽셀 단위)
  BREAKPOINT: 768,

  // 모바일에서의 애니메이션 스케일 (데스크톱 대비 비율)
  MOBILE_SCALE: 0.5,
  SECTION_MOVEMENTS: [
    { x: -2.5, y: 0, duration: 1 },
    { x: 0, y: 1, duration: 1 },
    { x: 2.5, y: 0, duration: 1 },
    { x: 0, y: -1, duration: 1 },
    { x: -2.5, y: 0, duration: 1 },
  ],
  VIEWPORT_WIDTH: 5,
};

const STYLES = {
  FIXED_ELEMENT: {
    position: "fixed",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 1000,
  },
  DOM_ELEMENT: {
    width: "30px",
    height: "30px",
    background: "red",
    borderRadius: "50%",
  },
  CURRENT_ELEMENT: {
    width: "30px",
    height: "30px",
    background: "green",
    borderRadius: "50%",
  },
  CANVAS: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  TRIGGER_SECTION: {
    height: "400vh",
    position: "relative",
    background: "rgba(0,0,0,0.1)",
  },
};
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
// 위치 공유를 위한 간단한 이벤트 시스템
// 개선된 eventSystem
const eventSystem = {
  listeners: {},
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(data));
    }
  },
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  },
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(
        (cb) => cb !== callback
      );
    }
  },
};

const DomElementWrapper = styled.div`
  ${STYLES.FIXED_ELEMENT}
  ${STYLES.DOM_ELEMENT}
  left: 0;
  top: 100px; // 원하는 상단 여백
`;

export const ThreeDElement = () => {
  const meshRef = useRef();
  const { camera, size } = useThree();

  useEffect(() => {
    const updatePosition = ({ x, y, phase, progress }) => {
      if (meshRef.current) {
        const {
          VIEWPORT_WIDTH,
          VIEWPORT_HEIGHT,
          MEET_POINT_X,
          MEET_POINT_Y,
          ENTRY_DURATION,
          PAUSE_DURATION,
          EXIT_DURATION,
        } = ANIMATION_SETTINGS;

        // 시작 위치 (오른쪽 상단)
        const startX = VIEWPORT_WIDTH / 2;
        const startY = VIEWPORT_HEIGHT / 2;

        // 만나는 지점
        const meetX = (MEET_POINT_X - 0.5) * VIEWPORT_WIDTH;
        const meetY = (0.5 - MEET_POINT_Y) * VIEWPORT_HEIGHT;

        // 끝 위치 (왼쪽)
        const endX = -VIEWPORT_WIDTH / 2;

        let newX, newY;

        if (progress < ENTRY_DURATION) {
          // 진입 단계
          const t = progress / ENTRY_DURATION;
          newX = gsap.utils.interpolate(startX, meetX, t);
          newY = gsap.utils.interpolate(startY, meetY, t);
        } else if (progress < ENTRY_DURATION + PAUSE_DURATION) {
          // 정지 단계
          newX = meetX;
          newY = meetY;
        } else {
          // 퇴장 단계
          const t =
            (progress - ENTRY_DURATION - PAUSE_DURATION) / EXIT_DURATION;
          newX = gsap.utils.interpolate(meetX, endX, t);
          newY = meetY;
        }

        gsap.to(meshRef.current.position, {
          x: newX,
          y: newY,
          duration: phase === "pause" ? 0 : 0.1,
          ease: "none",
        });

        // 화면 좌표로 변환하여 이벤트 발생
        const screenCoords = convertToScreenCoordinates(newX, newY, camera, {
          width: size.width,
          height: size.height,
        });
        eventSystem.emit("updateDomElementPosition", screenCoords);
      }
    };
    eventSystem.on("updateElementPosition", updatePosition);
    return () => eventSystem.off("updateElementPosition", updatePosition);
  }, [camera, size]);
  const convertToScreenCoordinates = (x, y, camera, canvas) => {
    const vector = new THREE.Vector3(x, y, 0);
    vector.project(camera);

    return {
      x: ((vector.x + 1) / 2) * canvas.width,
      y: ((-vector.y + 1) / 2) * canvas.height,
    };
  };
  return (
    <mesh
      ref={meshRef}
      position={[
        ANIMATION_SETTINGS.VIEWPORT_WIDTH / 2,
        ANIMATION_SETTINGS.VIEWPORT_HEIGHT / 2,
        0,
      ]}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  );
};

export const DomElement = () => {
  const domRef = useRef();
  const scrollTriggerRef = useContext(ScrollTriggerContext);
  const { objectTimeline } = useContext(TimelineContext);

  useEffect(() => {
    if (!scrollTriggerRef || !objectTimeline || !domRef.current) return;

    const sectionRefs = scrollTriggerRef.current.getSectionRefs();
    if (!sectionRefs || sectionRefs.length < 5) return;

    const section5 = sectionRefs[4];

    const updatePosition = ({ x, y }) => {
      gsap.to(domRef.current, {
        x: x,
        y: y,
        duration: 0.1,
        ease: "none",
      });
    };

    eventSystem.on("updateDomElementPosition", updatePosition);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section5,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      },
    });

    tl.to(domRef.current, { autoAlpha: 1, duration: 0.1 });

    objectTimeline.add(tl, 0);

    return () => {
      tl.kill();
      gsap.killTweensOf(domRef.current);
      eventSystem.off("updateDomElementPosition", updatePosition);
    };
  }, [scrollTriggerRef, objectTimeline]);

  return (
    <DomElementWrapper
      ref={domRef}
      style={{
        ...STYLES.FIXED_ELEMENT,
        ...STYLES.DOM_ELEMENT,
        position: "fixed",
        left: 0,
        top: 0,
        transform: "none",
        opacity: 0,
      }}
    >
      redDomElement
    </DomElementWrapper>
  );
};
export const CurrentDomElement = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updatePosition = ({ x, y, phase }) => {
      const newX = gsap.utils.mapRange(
        0,
        window.innerWidth,
        0,
        window.innerWidth,
        x
      );
      const newY = gsap.utils.mapRange(
        0,
        window.innerHeight,
        0,
        window.innerHeight,
        y
      );

      gsap.to(setPosition, {
        x: newX,
        y: newY,
        duration: phase === "pause" ? 0 : 0.1,
        ease: "none",
        onUpdate: () => setPosition({ x: newX, y: newY }),
      });
    };
    eventSystem.on("updateElementPosition", updatePosition);
    return () => eventSystem.off("updateElementPosition", updatePosition);
  }, []);

  return (
    <div
      style={{
        ...STYLES.FIXED_ELEMENT,
        ...STYLES.CURRENT_ELEMENT,
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      Current
    </div>
  );
};

// const LazyPhotoSection = lazy(() => import('./PhotoSection'));
// const LazyTimelineSection = lazy(() => import('./TimelineSection'));
const MainApp = () => {
  const scrollTriggerRef = useRef();
  const [totalPages, setTotalPages] = useState(1);
  const [timelines, setTimelines] = useState(() => ({
    mainTimeline: gsap.timeline(),
    objectTimeline: gsap.timeline(),
  }));

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (scrollTriggerRef.current) {
      setTotalPages(scrollTriggerRef.current.getTotalPages());
    }

    return () => {
      timelines.mainTimeline.kill();
      timelines.objectTimeline.kill();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [timelines]);

  return (
    <ScrollTriggerContext.Provider value={scrollTriggerRef}>
      <TimelineContext.Provider value={timelines}>
        <CanvasContainer>
          <Canvas
            shadows
            camera={{
              position: [0, 0, ANIMATION_SETTINGS.CAMERA_DISTANCE],
              fov: ANIMATION_SETTINGS.CAMERA_FOV,
            }}
            gl={{ antialias: true }}
            style={STYLES.CANVAS}
          >
            <ScrollControls pages={totalPages} damping={2}>
              <Scroll>
                <OtherComponent />
              </Scroll>
            </ScrollControls>
          </Canvas>
        </CanvasContainer>
        <DomAnimationSection />
        <ScrollContent>
          <ScrollTrig ref={scrollTriggerRef}>
            <div>
              <CurrentDomElement />
            </div>
            <TimelineSection animated />
            <div>Section 2</div>
            <PhotoSection />
            <div>Section 4</div>
            <DomElement animated />
          </ScrollTrig>
        </ScrollContent>
      </TimelineContext.Provider>
    </ScrollTriggerContext.Provider>
  );
};
export default MainApp;
