import React, { useRef ,useEffect} from 'react'
import * as THREE from "three";

import { useAnimations, useGLTF ,Environment,useScroll, Box, Circle, Points, useTexture, PositionalAudio } from '@react-three/drei'
import { useRecoilValue } from 'recoil'

import {IsEnteredAtom} from '../../../src/contexts'
import { Test } from './Test';


function Object() {
  const isEntered = useRecoilValue(IsEnteredAtom)

  const hemisphereLightRef = useRef()
  const boxRef = useRef()


  if (!isEntered) return <Test isCompleted />;
  return (
    <>
      <directionalLight position={[5,5,5]} />
      <ambientLight intensity={2} />
      <rectAreaLight  position={[0,10,0]} intensity={30}/>
      <hemisphereLight ref={hemisphereLightRef} position={[0,5,0]} intensity={0} groundColor={'lime'} color={'blue'}/>

      <group>
        <mesh>
          <boxGeometry args={[1, 2, 1]} />
          <meshStandardMaterial color="hotPink"/>
        </mesh>
      </group>
      <Box ref={boxRef} position={[0, 0, 0]} args={[100, 100, 100]}>
          <meshStandardMaterial color={"#DC4F00"} side={THREE.DoubleSide} />
      </Box>
      <Circle position-y={-4.4} args={[8,32]} rotation-x={[-Math.PI/2]}>
          <meshStandardMaterial color={"#DC4F00"} side={THREE.DoubleSide}/>
      </Circle>
    </>
  )
}

export default Object 