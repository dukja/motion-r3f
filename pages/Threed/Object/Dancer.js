
import React, { useEffect, useMemo, useRef, useState } from 'react'

import * as THREE from "three";
import { useAnimations, useGLTF ,Environment,useScroll, Box, Circle, Points, useTexture, PositionalAudio } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useRecoilValue } from 'recoil'

import {IsEnteredAtom} from '../../../src/contexts'
import {Loader} from '../../../src/components/Loader'

import { gsap } from "gsap";

let timeline;
const colors = {
    boxMaterialColor : "#DC4F00"
}
function Dancer() {
    const dancerRef = useRef(null)
    const rectAreaLightRef = useRef(null)
    const boxRef = useRef(null)
    const hemisphereLightRef = useRef(null)
    const starGroupRef01 = useRef(null)
    const starGroupRef02 = useRef(null)
    const starGroupRef03 = useRef(null)

    const [rotateFinished, setRotateFinished] = useState(false);
    const [currentAnimation, setCurrentAnimation] = useState("wave");
    
    const isEntered = useRecoilValue(IsEnteredAtom)
    
    const {scene, animations} = useGLTF("/3Ds/dancer.glb")
    // console.log(scene, animations)
    const {actions} = useAnimations(animations,dancerRef)
    const three  = useThree()
    const scroll  = useScroll()
    // console.log('scroll',scroll)
    const texture = useTexture("/textures/5.png");

    const {positions} = useMemo(()=>{
        const count = 500;
        const positions = new Float32Array(count*3)
        for(let i = 0; i < positions.length; i++){
            positions[i] = (Math.random()-0.5)*25
        }
        return {positions}
    },[])

    useFrame(()=>{
        // console.log('offset',scroll.offset)
        if(!isEntered )return
        timeline.seek(scroll.offset*timeline.duration())
        boxRef.current.material.color = new THREE.Color(colors.boxMaterialColor);
        if (rotateFinished) {
            setCurrentAnimation("breakdancingEnd");
          } else {
            setCurrentAnimation("wave");
          }
    })
    useEffect(()=>{
        isEntered &&
        actions['wave'].play()
    },[actions, isEntered])
    useEffect(()=>{
        if(!isEntered && !dancerRef.current)return
        gsap.fromTo(three.camera.position, {x:-5, y:5, z:5},{x:0, y:6, z:12, duration:2.5})
        gsap.fromTo(three.camera.rotation, {z:Math.PI},{z:0, duration:2.5})
        gsap.fromTo(colors,{ boxMaterialColor: "#0C0400" }, {duration: 2.5, boxMaterialColor: "#DC4F00"});
        gsap.to(starGroupRef01.current, {  yoyo: true,  duration: 2,  repeat: -1,  ease: "linear",  size: 0.05,});
        gsap.to(starGroupRef02.current, {  yoyo: true,  duration: 3,  repeat: -1,   ease: "power1.inOut", ease: "linear",  size: 0.05,});
        gsap.to(starGroupRef03.current, {  yoyo: true,  duration: 4,  repeat: -1,   ease: "elastic.in", ease: "linear",  size: 0.05,});
    },[isEntered, three.camera.position, three.camera.rotation])
    useEffect(()=>{
        if(!isEntered && !dancerRef.current)return
        const pivot = new THREE.Group();
        pivot.position.copy(dancerRef.current.position);
        pivot.add(three.camera);
        three.scene.add(pivot);
        timeline = gsap.timeline()
        timeline.from(dancerRef.current.rotation,{duration:4, y:Math.PI},0.5)
        .to(three.camera.position,{duration: 10,x: 2,z: 8},"<")
        .to(three.camera.position, {duration: 10,x: 0,z: 6,})
        .to(three.camera.position, {duration: 10,x: 0,z: 16,})
        .to(colors,{duration: 10,boxMaterialColor: "#0C0400",},"<")
        .to(pivot.rotation, {duration: 10,y: Math.PI,})
        .to(three.camera.position,{  duration: 10,  x: -4,  z: 12,},"<")
        .to(three.camera.position, {duration: 10,x: 0,z: 6,})
        .to(three.camera.position, {duration: 10,x: 0,z: 16,onUpdate: () => {  setRotateFinished(false);},})
        .to(hemisphereLightRef.current, {duration: 5,intensity: 30,})
        .to(pivot.rotation,{  duration: 15,  y: Math.PI * 4,  onUpdate: () => {    setRotateFinished(true);  },},"<")
        .to(colors,{  duration: 15,  boxMaterialColor: "#DC4F00",},"<");
        return () => {
          three.scene.remove(pivot);
        }},
        [isEntered, three.camera, three.scene])

      return isEntered?
        <>
            <primitive ref={dancerRef} object={scene} scale={0.05} />
            <ambientLight intensity={2} />
            <rectAreaLight ref={rectAreaLightRef} position={[0,10,0]} intensity={30}/>
            <hemisphereLight ref={hemisphereLightRef} position={[0,5,0]} intensity={0} groundColor={'lime'} color={'blue'}/>
            <Box ref={boxRef} position={[0, 0, 0]} args={[100, 100, 100]}>
                <meshStandardMaterial color={"#DC4F00"} side={THREE.DoubleSide} />
            </Box>

            <Circle position-y={-4.4} args={[8,32]} rotation-x={[-Math.PI/2]}>
                <meshStandardMaterial color={"#DC4F00"} side={THREE.DoubleSide}/>
            </Circle>
            <Points positions={positions.slice(0,positions.length/3)}>
                <pointsMaterial ref={starGroupRef01} size={0.5} sizeAttenuation
                    depthWrite
                    alphaMap={texture} transparent alphaTest={0.001} color={new THREE.Color("#DC4F00")}
                />
            </Points>
            <Points positions={positions.slice(positions.length/3,(positions.length*2)/3)}>
                <pointsMaterial ref={starGroupRef02} size={0.5} sizeAttenuation
                    depthWrite
                    alphaMap={texture} transparent alphaTest={0.001} color={new THREE.Color("#DC4F00")}
                />
            </Points>
            <Points positions={positions.slice((positions.length*2)/3)}>
                <pointsMaterial ref={starGroupRef03} size={0.5} sizeAttenuation
                    depthWrite
                    alphaMap={texture} transparent alphaTest={0.001} color={new THREE.Color("#DC4F00")}
                />
            </Points>
            <PositionalAudio
            position={[-24, 0, 0]}
            // autoplay
            url="/audio/bgm.mp3"
            distance={50}
            loop
            />
        </>
        :<Loader isCompleted />

}

export default Dancer