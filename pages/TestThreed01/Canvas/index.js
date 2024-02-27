import React, { useEffect, useState, Suspense,lazy} from 'react'

import * as THREE from "three"
import { Canvas } from '@react-three/fiber'
import { useControls } from 'leva';
import { OrbitControls ,ScrollControls} from '@react-three/drei';
import {useRecoilValue} from 'recoil';

import {Test} from '../Object/Test';
import Object from '../Object/Object';
import {IsEnteredAtom} from '../../../src/contexts'

// const Object = lazy(() => import('../Object/Object'));

export default function MainCanvas() {
  const [windowSize, setWindowSize] = useState({
    innerWidth: undefined,
    innerHeight: undefined,
  });

  const isEntered = useRecoilValue(IsEnteredAtom)

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { fov, near, far, position } = useControls({
    fov: 30,
    near: 0.01,
    far: 1000,
    position: [0, 6, 12],
  });
  return (
    <>
    <Canvas
     camera={{ fov,near,far,position,
      aspect: windowSize.innerWidth / windowSize.innerHeight, // aspect 비율 동적 계산
    }}
      shadows ={true}
      gl={{antialias:true}}
      scene={{background: new THREE.Color('#fff')}}
      // onCreated={({ gl }) => { gl.setClearColor(new THREE.Color('#000000')); }}
    >
      <ScrollControls pages={isEntered ? 8:0}>

      <Suspense fallback={<Test />}>
        <Object />
      </Suspense>
      {/* <OrbitControls /> */}
      {/* <gridHelper/>   */}
      </ScrollControls>
    </Canvas>
    </>
  )
}
