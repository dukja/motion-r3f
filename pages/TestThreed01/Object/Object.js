import React, { useRef ,useEffect} from 'react'

import * as THREE from "three";
import { useFrame, useThree } from '@react-three/fiber'
import { useAnimations, useGLTF ,Environment,useScroll, Box, Circle, Points, useTexture, PositionalAudio, useSelect } from '@react-three/drei'
import { useRecoilValue } from 'recoil'

import { gsap } from "gsap";

import {IsEnteredAtom} from '../../../src/contexts'

import {Test}  from './Test';
import useParticles from '../../../src/hooks/useParticles';

let timeline;
const colors = {
  boxMaterialColor : "#DC4F00"
}
function Object() {
  const {positions} = useParticles(500,0.5,25)

  const isEntered = useRecoilValue(IsEnteredAtom)

  const hemisphereLightRef = useRef()
  const boxRef = useRef(null)
  const objectRef = useRef(null)
  const pointGroupRef01 = useRef(null)

  const three  = useThree()
  const scroll = useScroll()
  const texture = useTexture("/textures/5.png");

  useFrame(()=>{
    if(!isEntered)return
    timeline.seek(scroll.offset*timeline.duration())
    boxRef.current.material.color = new THREE.Color(colors.boxMaterialColor);
  })

  useEffect(()=>{
    if(!isEntered && !objectRef.current)return
    gsap.fromTo(three.camera.position, {x:-5, y:5, z:5},{x:0, y:6, z:12, duration:2.5})
    gsap.fromTo(three.camera.rotation, {z:Math.PI},{z:0, duration:2.5})
    gsap.fromTo(colors,{ boxMaterialColor: "#0C0400" }, {duration: 2.5, boxMaterialColor: "#DC4F00"});
    // gsap.to(starGroupRef01.current, {  yoyo: true,  duration: 2,  repeat: -1,  ease: "linear",  size: 0.05,});
    // gsap.to(starGroupRef02.current, {  yoyo: true,  duration: 3,  repeat: -1,   ease: "power1.inOut", ease: "linear",  size: 0.05,});
    // gsap.to(starGroupRef03.current, {  yoyo: true,  duration: 4,  repeat: -1,   ease: "elastic.in", ease: "linear",  size: 0.05,});
},[isEntered, three.camera.position, three.camera.rotation])


  useEffect(()=>{
    if(!isEntered && !objectRef.current)return
    const pivot = new THREE.Group();
    pivot.position.copy(objectRef.current.position);
    pivot.add(three.camera);
    three.scene.add(pivot);
    timeline = gsap.timeline()
    timeline.from(objectRef.current.rotation,{duration:4, y:Math.PI},0.5)
    .to(three.camera.position,{duration: 10,x: 2,z: 8},"<")
    .to(colors,{duration: 10,boxMaterialColor: "#0C0400",},"<")
    return () => {
      three.scene.remove(pivot);
    }},[isEntered, three.camera, three.scene])

  if (!isEntered) return <Test />;
  return (
    <>
      <directionalLight position={[5,5,5]} />
      <ambientLight intensity={2} />
      <rectAreaLight  position={[0,10,0]} intensity={30}/>
      <hemisphereLight ref={hemisphereLightRef} position={[0,5,0]} intensity={0} groundColor={'lime'} color={'blue'}/>
{/* 
      <group>
        <mesh >
          <boxGeometry ref={objectRef} args={[1, 2, 1]} />
          <meshStandardMaterial color="hotPink"/>
        </mesh>
      </group> */}

      <Box ref={objectRef} position={[0, 0, 0]} args={[1, 2, 1]}>
          <meshStandardMaterial color="hotPink" />
      </Box>

      <Box ref={boxRef} position={[0, 0, 0]} args={[100, 100, 100]}>
          <meshStandardMaterial color={"#DC4F00"} side={THREE.DoubleSide} />
      </Box>
      <Circle position-y={-4.4} args={[8,32]} rotation-x={[-Math.PI/2]}>
          <meshStandardMaterial color={"#DC4F00"} side={THREE.DoubleSide}/>
      </Circle>

      <Points positions={positions.slice(0,positions.length/3)}>
          <pointsMaterial ref={pointGroupRef01} size={0.5} sizeAttenuation
              depthWrite
              alphaMap={texture} transparent alphaTest={0.001} color={new THREE.Color("#DC4F00")}
          />
      </Points>
    </>
  )
}

export default Object 