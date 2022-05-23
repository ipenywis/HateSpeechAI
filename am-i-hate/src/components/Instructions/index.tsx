import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Label = styled.h4`
  color: #191919;
  margin: 0;
`;

const Paragraph = styled.p`
  color: #8f8f8f;
  max-width: 455px;
  font-size: 12px;
  text-align: center;
  line-height: 1.6;
`;

export function Instructions() {
  return (
    <Container>
      <Label>How to Use?</Label>
      <Paragraph>
        Copy/Past or simply write your tweet/sentence you want to check if it’s
        hate speech or not (offensive, abusive, sexual)
      </Paragraph>
    </Container>
  );
}
