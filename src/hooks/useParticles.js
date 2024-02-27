import { useMemo } from "react";



export default function useParticles(countNumber, range, EndCount) {

    const {positions} = useMemo(()=>{
        const count = countNumber;
        const positions = new Float32Array(count*3)
        for(let i = 0; i < positions.length; i++){
            positions[i] = (Math.random()-range)*25
        }
        return {positions}
    },[])
        
  return {positions}
}
