import React from 'react'

function Object() {
  return (
    <>
    <directionalLight
    position={[5,5,5]} 
    />
    <group>
      <mesh>
        <Box material-color={0XFF0000}/>
        <boxGeometry />
        <meshStandardMaterial color="hotPink"/>
      </mesh>
    </group>
    </>
  )
}

export default Object 