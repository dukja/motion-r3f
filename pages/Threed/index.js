'use client'
import  React, { Suspense } from 'react'
import  { useState,useEffect} from 'react'

import * as THREE from "three"
import { Canvas } from '@react-three/fiber'
import {ScrollControls} from '@react-three/drei';
import { useControls } from 'leva';
import {useRecoilValue} from 'recoil';

import Dancer from './Object/Dancer';
import {Loader} from '../../src/components/Loader'
import {MovingDOM} from '../../src/components/MovingDom'
import {IsEnteredAtom} from '../../src/contexts'
import {FixedDOM} from '../../src/components/dom/FixedDOM'


function Threed() {
  const [windowSize, setWindowSize] = useState({ width: undefined, height: undefined });
  const color = useControls({
    value: 'navy',
  })
  const cameraCtr = useControls({
    fov:30,
    near:0.01,
    far:1000,
    position:[0,6,12],
  })

  const isEntered = useRecoilValue(IsEnteredAtom)

 

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);

    // 초기 사이즈 설정
    handleResize();

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => window.removeEventListener('resize', handleResize);
  }, []); // 빈 배열을 전달하여 컴포넌트 마운트 시에만 실행되도록 함

  // useFrame(()=>{
  //     console.log('offset',scroll.offset)
     
  // })
  return (
      <Canvas
        camera={{
          fov:cameraCtr.fov,
          near:cameraCtr.near,
          far:cameraCtr.far,
          position:cameraCtr.position,
          aspect: windowSize.innerWidth / windowSize.innerHeight
        }}
        shadows ="soft"
        gl={{antialias:true}}
        scene={{background: new THREE.Color(0X000000)}}
        >
          <ScrollControls pages={isEntered ? 8:0} damping={0.25}>
            {/* <color attach="background" args={[color.value]} /> */}
            <Suspense fallback={<Loader />}>
              <Dancer />
              <MovingDOM/>
              <FixedDOM/>
            </Suspense>
          </ScrollControls>
          {/* <OrbitControls /> */}
          {/* <axesHelper/> */}
          {/* <gridHelper/> */}
      </Canvas>
  )
}

export default Threed;