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
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Scroll, ScrollControls, useGLTF, useScroll } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import styled from "styled-components";
import "tailwindcss/tailwind.css";

gsap.registerPlugin(ScrollTrigger);
if (typeof window !== "undefined") {
  window.ScrollTrigger = ScrollTrigger;
}

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

// const ScrollContent = styled.div`
//   position: absolute;
//   top: 0;
//   left: 0;
//   width: 100%;
//   z-index: 2;
// `;
const ScrollContent = styled.div`
  position: relative;
  width: 100%;
  height: 500vh; // 5 pages worth of scrollable content
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
  const [isPaused, setIsPaused] = useState(false);
  const animationsRef = useRef(new Map());

  const createFloatingAnimation = useCallback(
    (element, options = {}) => {
      const {
        yOffset = 10,
        duration = 2,
        ease = "sine.inOut",
        amplitude = 0.1,
        frequency = 1,
        is3D = false,
        customEase,
        responsiveScale = 1,
      } = options;

      if (!element) return null;

      const animateFloat = (delta) => {
        if (isPaused) return 0;
        time.current += delta;
        return Math.sin(time.current * frequency) * amplitude * responsiveScale;
      };

      if (is3D) {
        return (delta) => {
          element.position.y += animateFloat(delta);
        };
      } else {
        const easingFunction = customEase || ease;
        return gsap.to(element, {
          y: `+=${yOffset * responsiveScale}`,
          duration,
          repeat: -1,
          yoyo: true,
          ease: easingFunction,
          paused: isPaused,
        });
      }
    },
    [isPaused]
  );

  const stopFloating = useCallback((id) => {
    const animationData = animationsRef.current.get(id);
    if (!animationData) return;

    const { animation, element, options } = animationData;
    if (options.is3D) {
      element.position.y = 0;
    } else {
      animation.kill();
      gsap.to(element, { y: 0, duration: 0.3 });
    }
    animationsRef.current.delete(id);
  }, []);

  const startFloating = useCallback(
    (element, options = {}) => {
      const animation = createFloatingAnimation(element, options);
      const id = Math.random().toString(36).substr(2, 9);
      animationsRef.current.set(id, { animation, element, options });
      return id;
    },
    [createFloatingAnimation]
  );

  const pauseAllAnimations = useCallback(() => {
    setIsPaused(true);
    animationsRef.current.forEach(({ animation, options }) => {
      if (!options.is3D) {
        animation.pause();
      }
    });
  }, []);

  const resumeAllAnimations = useCallback(() => {
    setIsPaused(false);
    animationsRef.current.forEach(({ animation, options }) => {
      if (!options.is3D) {
        animation.resume();
      }
    });
  }, []);

  const synchronizeAnimations = useCallback(() => {
    const now = gsap.ticker.time;
    animationsRef.current.forEach(({ animation }) => {
      if (animation.play) {
        animation.play(now);
      }
    });
  }, []);

  const updateResponsiveness = useCallback(
    (scale) => {
      animationsRef.current.forEach(({ animation, element, options }) => {
        const newOptions = { ...options, responsiveScale: scale };
        if (options.is3D) {
          // 3D 요소의 경우 새로운 스케일을 적용한 애니메이션을 생성
          animation = createFloatingAnimation(element, newOptions);
        } else {
          // DOM 요소의 경우 GSAP 애니메이션 업데이트
          animation.vars.y = `+=${options.yOffset * scale}`;
          animation.invalidate().restart();
        }
      });
    },
    [createFloatingAnimation]
  );

  // 메모리 누수 방지를 위한 정리 함수
  useEffect(() => {
    return () => {
      animationsRef.current.forEach(({ animation, options }) => {
        if (!options.is3D && animation.kill) {
          animation.kill();
        }
      });
    };
  }, []);

  return {
    startFloating,
    stopFloating,
    pauseAllAnimations,
    resumeAllAnimations,
    synchronizeAnimations,
    updateResponsiveness,
  };
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
      if (ScrollTrigger) {
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
      }
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

  const createSectionTrigger = useCallback(
    (section, totalScrollHeight) => {
      const sectionHeight = window.innerHeight;
      const isAnimated = section.dataset.animated === "true";
      const isPhotoSection = section.classList.contains("photo-section");
      const isSynchronizedAnimation = section.classList.contains(
        "synchronized-animation"
      );
      const isFixedElement = section.classList.contains("fixed-elements");

      if (isFixedElement) {
        // fixed-elements에 대한 특별한 처리
        const currentDomElement = section.querySelector(".current-dom-element");
        const threeDElement = section.querySelector(".three-d-element");

        if (currentDomElement) {
          gsap.to(currentDomElement, {
            x: gsap.utils.wrap(0, window.innerWidth),
            repeat: -1,
            duration: 20,
            ease: "none",
            scrollTrigger: {
              trigger: "body",
              start: "top top",
              end: "bottom bottom",
              scrub: 1,
            },
          });
        }

        if (threeDElement) {
          gsap.to(threeDElement.position, {
            x: gsap.utils.wrap(-2.5, 2.5),
            repeat: -1,
            duration: 20,
            ease: "none",
            scrollTrigger: {
              trigger: "body",
              start: "top top",
              end: "bottom bottom",
              scrub: 1,
            },
          });
        }

        return totalScrollHeight; // fixed-elements는 스크롤 높이에 영향을 주지 않음
      }

      if (isPhotoSection || isSynchronizedAnimation) {
        totalScrollHeight += sectionHeight * 4; // 4배의 높이 적용
        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          pin: false,
          scrub: true,
          markers: true,
        });
      } else if (isAnimated) {
        totalScrollHeight += sectionHeight;
        mainTimeline.to(section, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
            toggleActions: "play none none reverse",
          },
        });
      } else {
        totalScrollHeight += sectionHeight;
        objectTimeline.to(section, {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top center",
            end: "bottom center",
            scrub: 1,
            toggleActions: "play none none reverse",
          },
        });
      }
      return totalScrollHeight;
    },
    [mainTimeline, objectTimeline]
  );

  useEffect(() => {
    const sections = sectionRefs.current;
    let totalScrollHeight = 0;
    const triggers = [];

    const updateSections = () => {
      totalScrollHeight = 0;
      sections.forEach((section) => {
        totalScrollHeight = createSectionTrigger(section, totalScrollHeight);
        if (section._gsap && section._gsap.scrollTrigger) {
          triggers.push(section._gsap.scrollTrigger);
        }
      });
      setTotalHeight(totalScrollHeight);
      setTotalPages(Math.ceil(totalScrollHeight / window.innerHeight));
    };

    updateSections();

    const debouncedUpdateSections = debounce(updateSections, 250);
    window.addEventListener("resize", debouncedUpdateSections);

    return () => {
      triggers.forEach((trigger) => trigger.kill());
      window.removeEventListener("resize", debouncedUpdateSections);
    };
  }, [createSectionTrigger]);

  const memoizedChildren = useMemo(
    () =>
      React.Children.map(children, (child, index) => (
        <SectionDiv
          ref={(el) => (sectionRefs.current[index] = el)}
          key={index}
          className={`scrollTrigger-${index} section ${
            child.props.className || ""
          }`}
          data-animated={child.props.animated ? "true" : "false"}
          aria-label={`Section ${index + 1}`}
          style={{
            opacity: child.props.animated ? 0 : 1,
            transform: child.props.animated ? "translateY(50px)" : "none",
          }}
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

const ANIMATION_SETTINGS = {
  MEET_POINT: 0.3,
  MEET_START: 0.4,
  MEET_END: 0.6,
  TOTAL_DURATION: 5,
  BREAKPOINT: 768,
  MOBILE_SCALE: 0.5,

  get MEET_POINT_X() {
    return window.innerWidth * this.MEET_POINT;
  },
  get MEET_POINT_Y() {
    return window.innerHeight * 0.5;
  },
  get MEET_POINT_THREE_X() {
    return (this.MEET_POINT - 0.5) * 5;
  },

  getScale() {
    return window.innerWidth < this.BREAKPOINT ? this.MOBILE_SCALE : 1;
  },

  getAnimationTiming(stage) {
    const scale = this.getScale();
    switch (stage) {
      case "start":
        return this.MEET_START * scale;
      case "middle":
        return (this.MEET_END - this.MEET_START) * scale;
      case "end":
        return (1 - this.MEET_END) * scale;
      default:
        return 0;
    }
  },
};
const STYLES = {
  FIXED_ELEMENT: {
    position: "fixed",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 1000,
  },
  DOM_ELEMENT: {
    width: "50px",
    height: "50px",
    background: "red",
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

export const CurrentDomElement = forwardRef((props, ref) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updatePosition = (newPosition) => setPosition(newPosition);
    eventSystem.on("updatePosition", updatePosition);
    return () => eventSystem.off("updatePosition", updatePosition);
  }, []);

  return (
    <div
      ref={ref}
      className="current-dom-element"
      style={{
        ...STYLES.FIXED_ELEMENT,
        ...STYLES.CURRENT_ELEMENT,
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      Current
    </div>
  );
});

export const DomElement = forwardRef((props, ref) => {
  return (
    <div
      ref={ref}
      style={{
        ...STYLES.FIXED_ELEMENT,
        ...STYLES.DOM_ELEMENT,
        left: 0,
      }}
    >
      redDomElement
    </div>
  );
});

export const ThreeDElement = forwardRef((props, ref) => {
  const localRef = useRef();
  const { viewport } = useThree();
  const scroll = useScroll();

  useImperativeHandle(ref, () => localRef.current);

  useFrame(() => {
    if (localRef.current) {
      // 스크롤 위치에 따라 x 위치 계산
      const scrollY = scroll.offset; // 0 to 1
      const x = gsap.utils.mapRange(0, 1, -2.5, 2.5, scrollY);

      localRef.current.position.x = x;

      console.log("ThreeDElement position:", x, "Scroll offset:", scrollY);

      const viewportX = gsap.utils.mapRange(-2.5, 2.5, 0, viewport.width, x);
      eventSystem.emit("updatePosition", {
        x: viewportX * window.innerWidth,
        y: window.innerHeight / 2,
      });
    }
  });

  return (
    <mesh
      ref={localRef}
      className="three-d-element"
      position={[-2.5, 0, 0]}
      scale={[1, 1, 1]}
    >
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  );
});
export const SynchronizedAnimation = ({ threeDRef }) => {
  const domRef = useRef();
  const currentDomRef = useRef();
  const scrollTriggerRef = useScrollTrigger();

  useEffect(() => {
    if (
      !scrollTriggerRef?.current ||
      !domRef.current ||
      !currentDomRef.current ||
      !threeDRef.current
    )
      return;

    const sectionRefs = scrollTriggerRef.current.getSectionRefs();
    const allSections = sectionRefs;
    const lastSection = sectionRefs[sectionRefs.length - 1];

    // ThreeDElement 애니메이션 (모든 섹션에서 스크롤 방향으로 이동)
    gsap.fromTo(
      threeDRef.current.position,
      { x: -2.5 },
      {
        x: 2.5,
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          markers: true,
        },
      }
    );

    // CurrentDomElement 애니메이션 (ThreeDElement를 따라다님)
    gsap.to(currentDomRef.current, {
      x: gsap.utils.wrap(0, window.innerWidth),
      ease: "none",
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      },
    });

    // DomElement 애니메이션 (Section 5에서만 나타남)
    gsap.fromTo(
      domRef.current,
      { x: window.innerWidth, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        scrollTrigger: {
          trigger: lastSection,
          start: "top center",
          end: "bottom center",
          scrub: 1,
        },
      }
    );
  }, [scrollTriggerRef, threeDRef]);

  return (
    <>
      <div className="fixed-elements">
        <CurrentDomElement ref={currentDomRef} />
      </div>
      <div
        className="synchronized-animation"
        data-animated="true"
        style={STYLES.TRIGGER_SECTION}
      >
        <DomElement ref={domRef} />
      </div>
    </>
  );
};

const MainApp = () => {
  const currentDomRef = useRef();
  const scrollTriggerRef = useRef();
  const threeDRef = useRef();
  const [timelines, setTimelines] = useState(() => ({
    mainTimeline: gsap.timeline(),
    objectTimeline: gsap.timeline(),
  }));
  useEffect(() => {
    const handleScroll = () => {
      console.log("Window scroll:", window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
      console.log("ScrollTrigger initialized:", ScrollTrigger.defaults);
    }

    return () => {
      if (typeof window !== "undefined") {
        timelines.mainTimeline.kill();
        timelines.objectTimeline.kill();
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        ScrollTrigger.killAll();
      }
      ScrollTrigger.defaults({ markers: true });
      ScrollTrigger.config({ ignoreMobileResize: true });
    };
  }, [timelines]);

  return (
    <ScrollTriggerContext.Provider value={scrollTriggerRef}>
      <TimelineContext.Provider value={timelines}>
        <CanvasContainer>
          <Canvas
            shadows
            camera={{ position: [0, 0, 15], fov: 60 }}
            gl={{ antialias: false }}
          >
            <ScrollControls pages={5} damping={0.1}>
              <Scroll>
                <OtherComponent />
                <ThreeDElement ref={threeDRef} />
                <axesHelper args={[5]} />
                <gridHelper args={[10, 10]} />
              </Scroll>
              <Scroll html>
                <div style={{ height: "500vh" }}>
                  {/* 스크롤 가능한 내용 */}
                  <h1
                    style={{ position: "sticky", top: 0, background: "white" }}
                  >
                    Scroll down
                  </h1>
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      style={{
                        height: "100vh",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <h2>Section {i + 1}</h2>
                    </div>
                  ))}
                </div>
              </Scroll>
            </ScrollControls>
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
          </Canvas>
        </CanvasContainer>
        <DomAnimationSection />
        <ScrollContent>
          <ScrollTrig ref={scrollTriggerRef}>
            <TimelineSection animated />
            <div>Section 2</div>
            <PhotoSection />
            <div>Section 4</div>
            <SynchronizedAnimation threeDRef={threeDRef} />
          </ScrollTrig>
        </ScrollContent>
      </TimelineContext.Provider>
    </ScrollTriggerContext.Provider>
  );
};
export default MainApp;
