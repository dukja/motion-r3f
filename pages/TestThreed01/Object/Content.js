import React from 'react'

import { Html ,Scroll } from '@react-three/drei'
import { useRecoilValue } from "recoil";

import {Typography,Stack} from '@mui/material';

import {IsEnteredAtom} from '../../../src/contexts'

import  Loading from '../../TestThreed01/Object/Loading';


export default function Content() {
  const isEntered = useRecoilValue(IsEnteredAtom)

  if (!isEntered) return <Loading />;
  return (
    <Scroll>
      <Html>
        <Stack>
          <Typography>Content</Typography>
        </Stack>
      </Html>      
    </Scroll>

  )
}
