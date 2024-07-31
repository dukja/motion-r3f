import React, { useEffect, useRef } from "react";
import styled from "styled-components";

const Container = styled.div`
  position: relative;
  width: 100vw;
  display: flex;
  flex-direction: column;
  border: 1px solid green;
`;

const Box = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid blue;
`;

export default function TimelineBoxWrap() {
  const boxRef = useRef([]);

  return (
    <Container>
      <Box ref={(el) => (boxRef.current[0] = el)}>
        <div>1</div>
      </Box>
      <Box ref={(el) => (boxRef.current[1] = el)}>
        <div>2</div>
      </Box>
      <Box ref={(el) => (boxRef.current[2] = el)}>
        <div>3</div>
      </Box>
      <Box ref={(el) => (boxRef.current[2] = el)}>
        <div>4</div>
      </Box>
    </Container>
  );
}
