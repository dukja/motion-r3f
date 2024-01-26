import React, { useEffect, useRef } from 'react'
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber'
import { useControls } from 'leva';
import { useTexture, useHelper , Environment} from '@react-three/drei';

function Object() {
    const {size, gl, scene, camera} = useThree()
    const meshRef = useRef()
    const groupRef01 = useRef()
    const lightDRef01 = useRef(null)
    const controls = useControls({
        thickness : {value:0, min: 0.1}
    })
    
    const matcap = useTexture('./imgs/matcap-crystal.png')
    const tone = useTexture('./imgs/fiveTone.jpg')
    // useFrame((state, delta)=>{
        // console.log(state, delta)
    // })
    useEffect(() => {
        if (groupRef01.current) {
            // groupRef01의 위치를 캔버스의 중앙으로 설정
            groupRef01.current.position.set(0, 0, 0);
        }
    }, []); // 의존성 배열을 빈 배열로 설정하여 컴포넌트 마운트 시에만 실행
     
    useEffect(()=>{
        const objs = groupRef01.current.children;
        objs.forEach((obj,index) => {
            obj.geometry = meshRef.current.geometry;
            obj.position.x = (index+1) * 2;
            obj.position.z = 0;
        })
    })
    useHelper(lightDRef01, THREE.DirectionalLightHelper)
  return (
    <>
  
        <directionalLight
            castShadow
            // shadow-camera-top={10}
            // shadow-camera-bottom={-10}
            // shadow-camera-left={-10}
            // shadow-camera-right={10}
            shadow-mapSize = {[512,512]}
            ref={lightDRef01}
            // color={'#fff'} 
            position={[5,5,5]} 
            intensity={1}
            target-position={[0,0,2]}
            />

        <mesh
            rotation-x={[THREE.MathUtils.degToRad(-90)]}
            position-y={-1}
            receiveShadow>
                <planeGeometry args={[15,15]}/>
                <meshStandardMaterial color={'grey'} side={THREE.DoubleSide}/>
        </mesh>
        <mesh
            ref={meshRef}
            visible={false}>
            <boxGeometry />
            <meshStandardMaterial color="pink"/>
        </mesh>
        <group ref={groupRef01}>
            <mesh>
                <meshStandardMaterial wireframe color="hotPink"/>
            </mesh>
            <mesh castShadow receiveShadow>
                <meshMatcapMaterial matcap={matcap} />
            </mesh>
            <mesh>
                <meshToonMaterial gradientMap={tone} />
            </mesh>
            <mesh>
                <meshPhysicalMaterial 
                        color="#fff"
                        visible={true}
                        transparent={true}
                        opacity={1}
                        side={THREE.FrontSide}
                        alphaTest={1}
                        depthTest={true}
                        depthWrite={true}
                        fog={true}

                        emissive={'black'}
                        roughness={0}
                        metalness={0}
                        clearcoat={0}
                        clearcoatRoughness={0}

                        transmission={1}
                        thickness={controls.thickness}
                        ior={2.33}
                        // flatShading={true}
                    />
            </mesh>
        </group>
    </>
  )
}

export default Object