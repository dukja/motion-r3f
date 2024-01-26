import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei';
import { useControls } from 'leva';

import Object from './Object'

export default function TestThreed() {
  const color = useControls({
    value: 'navy',
  })
  return (
    <Canvas
    
    >
      <color attach="background" args={[color.value]} />
      <OrbitControls />
      <gridHelper/>
      <Object/>
    </Canvas>
  )
}
