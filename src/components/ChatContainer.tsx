import { ChatCompletionRequestMessage } from "openai";
import { useEffect, useState } from "react";
import CursorSVG from "./icons/CursorSVG";
import { Dispatch, SetStateAction } from "react";

interface ChatContainerProps {
  chatHistory: ChatCompletionRequestMessage[];
}

const streamingInterval = {
  character: 60,
  word: 200,
  sentence: 1000,
  paragraph: 1000,
}

export default function ChatContainer({ chatHistory, setLoadingResponse }: { chatHistory: ChatContainerProps[], setLoadingResponse: Dispatch<SetStateAction<boolean>> }) {
  const [displayResponse, setDisplayResponse] = useState("");
  const [completedTyping, setCompletedTyping] = useState(false);

  useEffect(() => {
    if (!chatHistory?.length) {
      return;
    }

    setCompletedTyping(false);

    let i = 0;

    const stringResponse = chatHistory[chatHistory.length - 1].content;
    console.log(stringResponse);
    let interval = streamingInterval.character;
    let tokenizedResponse = stringResponse;
    let joiner = '';
    const streamingMode = process.env['NEXT_PUBLIC_ANSWER_STREAMING_MODE']
    console.log(process.env['NEXT_PUBLIC_ANSWER_STREAMING_MODE']);

    switch (streamingMode) {
      case 'CHARACTER':
        break;
      case 'WORD':
        // interval = streamingInterval.word;
        tokenizedResponse = stringResponse.split(" ");
        interval = (stringResponse.length * streamingInterval.character) / tokenizedResponse.length;
        joiner = ' ';
        break;
      case 'SENTENCE':
        // interval = streamingInterval.sentence;
        tokenizedResponse = stringResponse.split(".");
        interval = (stringResponse.length * streamingInterval.character) / (tokenizedResponse.length - 1);
        joiner = '.';
        break;
      case 'PARAGRAPH':
        // interval = streamingInterval.paragraph;
        tokenizedResponse = stringResponse.split("\n");
        interval = (stringResponse.length * streamingInterval.character) / (tokenizedResponse.length - 1);
        joiner = '\n';
    }
    console.log(`Streaminig interval ${interval}`)
    const intervalId = setInterval(() => {

      let response = tokenizedResponse.slice(0, i);
      if (joiner) {
        response = response.join(joiner)
      }
      i++;
      if (i < tokenizedResponse.length) {
        response += "  ⚫"

        if (chatHistory.length % 2 == 1 && chatHistory.length != 1) {
          setLoadingResponse(true);
        }
      }

      setDisplayResponse(response);

      if (i > stringResponse.length) {
        clearInterval(intervalId);
        setCompletedTyping(true);
        setLoadingResponse(false);
      }

    }, interval);

    return () => clearInterval(intervalId);
  }, [chatHistory]);

  return (
    <div className="max-h-0">
      {chatHistory.map((message, messageIndex) => (
        <div key={messageIndex}>
          {message?.role === "user" && (
            <div className="chat chat-end">
              <span className="speaker chat-bubble whitespace-pre-line">
                {message?.content}
              </span>
            </div>
          )}
          {messageIndex === chatHistory.length - 1 &&
            message?.role === "assistant" && (
              <div className="chat chat-start">
                <span className="chatgpt_answer chat-bubble whitespace-pre-line">
                  {displayResponse}
                  {!completedTyping && <CursorSVG />}
                </span>
              </div>
            )}
          {message?.role === "assistant" &&
            messageIndex !== chatHistory.length - 1 && (
              <div className="chat chat-start">
                <span className="chatgpt_answer chat-bubble whitespace-pre-line">
                  {message?.content}
                </span>
              </div>
            )}
        </div>
      ))}
    </div>
  );
}
