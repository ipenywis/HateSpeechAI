import React, { useEffect, useState } from "react";
import "./App.css";
import styled from "styled-components";
import { Instructions } from "./components/Instructions";
import { TextField } from "./components/textField";
import axios from "axios";
import { indexOfMax } from "./utils/common";
import { MODEL_CLASSES } from "./constants";
import { BsArrowBarDown } from "react-icons/bs";

const AppContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3px;
  font-family: "Roboto Mono", monospace;
  overflow-x: hidden;
`;

const Title = styled.h1`
  color: #191919;
  font-weight: 700;
  position: relative;
  margin-bottom: 1.3em;

  &:after {
    content: "";
    position: absolute;
    bottom: -15px;
    left: 60%;
    transform: translateX(-60%);
    width: 120%;
    height: 2px;
    border-radius: 4px;
    background-color: #1d6cba;
  }

  &:before {
    content: "";
    position: absolute;
    bottom: -9px;
    left: 60%;
    transform: translateX(-60%);
    width: 100%;
    height: 2px;
    border-radius: 4px;
    background-color: #1d6cba;
  }
`;

const Icon = styled.span`
  margin-top: 0.2em;
  font-size: 60px;
  color: #4e4747;
`;

const ResultContainer = styled.div<{ color: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 0em;
  font-size: 40px;
  font-weight: bold;
  color: ${({ color }) => color};
`;

function App() {
  const [result, setResult] = useState("");
  const [color, setColor] = useState("#e34a4a");

  const predict = async (text: string) => {
    setResult("");
    const modelURL =
      "http://localhost:8888/proxy/v1/models/hate_speech:predict";
    const data = { inputs: [text] };
    const response = await axios.post(modelURL, data, {
      headers: { "Content-Type": "application/json" },
    });

    console.log("Response: ", response);
    const prediction = response.data.outputs[0] as number[];
    console.log("Predicted class: ", indexOfMax(prediction));

    indexOfMax(prediction);

    const modelClass = MODEL_CLASSES[indexOfMax(prediction)];

    if (modelClass === MODEL_CLASSES[2]) setColor("#59dcda");
    else setColor("#e34a4a");

    setResult(modelClass);
  };

  return (
    <AppContainer>
      <Title>Am I Hate?</Title>
      <Instructions />
      <TextField onSubmit={predict} />
      <Icon>
        <BsArrowBarDown />
      </Icon>
      <ResultContainer color={color}>{result}</ResultContainer>
    </AppContainer>
  );
}

export default App;
