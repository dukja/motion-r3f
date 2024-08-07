import React, { useEffect, useRef } from "react";
import styled from "styled-components";

const ContentDiv = styled.div`
  position: absolute;
  top: 0;
  border: 1px solid yellow;
  display: flex;
`;

const SectionDiv = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 10px solid red;
  font-size: 24px;
`;

export default function TimelineBoxWrap() {
  const boxRef = useRef([]);

  return (
    <ContentDiv>
      <SectionDiv>1</SectionDiv>
      <SectionDiv>1</SectionDiv>
      <SectionDiv>1</SectionDiv>
      <SectionDiv>1</SectionDiv>
      <SectionDiv>1</SectionDiv>
    </ContentDiv>
  );
}
