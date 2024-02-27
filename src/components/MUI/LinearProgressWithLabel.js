import {LinearProgress,Box,Typography,Stack} from '@mui/material';
import gsap from 'gsap';
import { useEffect, useRef ,useState} from 'react';

function LinearProgressWithLabel(props) {
  const value = String(Math.round(props.value))
    const [digits, setDegits] =  useState([...value])
    const  preDigitRefs = useRef([...value])
    const digitRefs = useRef([]);
    const digitBoxRef = useRef();
    useEffect(()=>{
      const  newDigits = [...value]
      setDegits(newDigits)

      newDigits.forEach((newDigit, index) => {
        if (preDigitRefs.current[index] !== newDigit) {
          const distance = digitBoxRef.current.offsetHeight
          gsap.fromTo(
            digitRefs.current[index],
            { y: -distance, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4, ease: "power4.out" } 
          );
        }
      });

      preDigitRefs.current = newDigits;
    },[props.value,digitRefs])
    return (
      <Stack justifyContent='center' alignItems='center' spacing={2}
>
        <Stack direction='row'>
          {digits.map((digit, index)=>(
            <Box ref={digitBoxRef} sx={{ minWidth: 0, py:2, overflow: 'hidden'}}><Typography variant="h2" color="black" key={index} ref={(el) => (digitRefs.current[index] = el)}>{digit}</Typography></Box> 
          ))}          
        </Stack>
               
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress variant="determinate" {...props} />
        </Box>
      </Stack>
    );
  }
  export default LinearProgressWithLabel