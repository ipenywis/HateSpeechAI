import React, { useState } from "react";
import styled, { css } from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2em;
`;

const AreaContainer = styled.div<{ isBackdrop?: boolean }>`
  position: relative;

  ${({ isBackdrop }) =>
    isBackdrop &&
    css`
      &::before {
        content: "Predicting...";
        font-weight: bold;
        color: white;
        width: 100%;
        height: 97%;
        position: absolute;
        top: 0;
        left: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.4);
        z-index: 99;
      }
    `}
`;

const Textarea = styled.textarea`
  min-width: 700px;
  min-height: 100px;
  max-height: 250px;
  outline: none;
  border: 2px solid #202020;
  background-color: #e9e9e9;
  padding: 15px;
  resize: vertical;
  font-size: 15px;
  line-height: 1.4;
  position: relative;
`;

const Button = styled.button`
  background: #363636;
  color: #fff;
  padding: 8px 2.4em;
  outline: none;
  border: none;
  font-weight: bold;
  border-radius: 3px;
  margin-top: 1em;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: #1d6cba;
  }

  &:active {
    transition: all 0.1s ease-in-out;
    background: #144a7f;
  }

  &:disabled {
    opacity: 0.4;
    background: #363636;
  }
`;

const ErrorContainer = styled.span`
  color: #d45252;
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 10px;
`;

const Backdrop = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
`;

interface ITextFieldProps {
  disabled?: boolean;
  onSubmit: (text: string) => void;
}

export function TextField(props: ITextFieldProps) {
  const [text, setText] = useState("");
  const [isLoading, setLoading] = useState(false);
  const { disabled, onSubmit } = props;
  const [error, setError] = useState<string | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text || text.trim() === "") return setError("Please enter some text");

    setLoading(true);

    if (disabled) return;

    await onSubmit(text);

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Container>
        <ErrorContainer>{error}</ErrorContainer>
        <AreaContainer isBackdrop={isLoading}>
          <Textarea
            disabled={disabled}
            value={text}
            onChange={handleTextChange}
          />
        </AreaContainer>
        <Button type="submit" disabled={disabled}>
          {isLoading ? "Checking..." : "Check"}
        </Button>
      </Container>
    </form>
  );
}
