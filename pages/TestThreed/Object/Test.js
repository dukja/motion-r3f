import React,{useEffect,useState} from 'react'

import { Html } from '@react-three/drei'
import { useRecoilState } from "recoil";

import {Button, Stack, Box} from "@mui/material";
import LinearProgressWithLabel from '../../../src/components/MUI/LinearProgressWithLabel';

import { IsEnteredAtom } from "../../../src/contexts";

export const Test = ({isCompleted})=> {
    const [isEntered, setIsEntered] = useRecoilState(IsEnteredAtom);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prevProgress) => {
            const diff = Math.random() * 10;
            const progress = Math.min(prevProgress + diff, 100);
            if (progress >= 100) {
              clearInterval(timer);
              setIsEntered(true);
            }
            return progress;
          });
        }, 500);
    
        return () => clearInterval(timer);
      }, [setIsEntered]);
    if (isEntered) return null;
    return (
    <Html center>
        <Stack sx={{width:'100vw',height:'100vh' }}
          justifyContent="center" alignItems="center"
          spacing={2}>
         <Stack sx={{width:'40vw'}}>
            <LinearProgressWithLabel value={progress} />
        </Stack>
        <Button variant='contained' size="large" 
            onClick={()=>setIsEntered(true)}>Enter</Button>
        </Stack>
    </Html>
    )
}
