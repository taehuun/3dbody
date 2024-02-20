import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { useMeeting, usePubSub } from "@videosdk.live/react-sdk";
import { useEffect, useRef, useState } from "react";
import { formatAMPM, json_verify, nameTructed } from "../../utils/helper";

const ChatMessage = ({ senderId, senderName, text, timestamp }) => {
  const mMeeting = useMeeting();
  const localParticipantId = mMeeting?.localParticipant?.id;
  const localSender = localParticipantId === senderId;

  return (
    <div
      className={`flex ${localSender ? "justify-end" : "justify-start"} mt-4`}
      style={{
        maxWidth: "100%",
      }}
    >
      <div
        className={`flex ${
          localSender ? "items-end bg-teal-700" : "items-start bg-gray-500"
        } flex-col py-1 px-2 rounded-md`}
      >
        <p style={{ color: "#ffffff80" }}>
          {localSender ? "You" : nameTructed(senderName, 15)}
        </p>
        <div>
          <p className="inline-block text-right text-white break-words whitespace-pre-wrap">
            {text}
          </p>
        </div>
        <div className="mt-1">
          <p className="text-xs" style={{ color: "#ffffff80" }}>
            {formatAMPM(new Date(timestamp))}
          </p>
        </div>
      </div>
    </div>
  );
};

const ChatInput = ({ inputHeight }) => {
  const [message, setMessage] = useState("");
  const { publish } = usePubSub("CHAT");
  const input = useRef();

  return (
    <div
      className="flex items-center w-full px-2"
      style={{ height: inputHeight }}
    >
      <div className="relative w-full">
        <span className="absolute inset-y-0 right-0 flex mr-2 rotate-90 ">
          <button
            disabled={message.length < 1}
            type="submit"
            className="p-1 focus:outline-none focus:shadow-outline"
            onClick={() => {
              const messageText = message.trim();
              if (messageText.length > 0) {
                publish(messageText, { persist: true });
                setTimeout(() => {
                  setMessage("");
                }, 100);
                input.current?.focus();
              }
            }}
          >
            <PaperAirplaneIcon
              className={`w-6 h-6 ${
                message.length < 1 ? "text-gray-500" : "text-teal-700"
              }`}
            />
          </button>
        </span>
        <input
          type="text"
          className="w-full py-4 pl-2 pr-10 text-base text-black border border-gray-400 rounded bg-gray-750 focus:outline-none"
          placeholder="메세지를 입력하세요"
          // autocomplete="off"
          ref={input}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
          }}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              const messageText = message.trim();

              if (messageText.length > 0) {
                publish(messageText, { persist: true });
                setTimeout(() => {
                  setMessage("");
                }, 100);
                input.current?.focus();
              }
            }
          }}
        />
      </div>
    </div>
  );
};

const ChatMessages = ({ listHeight }) => {
  const listRef = useRef();
  const { messages } = usePubSub("CHAT");

  const scrollToBottom = (data) => {
    if (!data) {
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    } else {
      const { text } = data;

      if (json_verify(text)) {
        const { type } = JSON.parse(text);
        if (type === "CHAT") {
          if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
          }
        }
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return messages ? (
    <div ref={listRef} style={{ overflowY: "scroll", height: listHeight }}>
      <div className="p-4">
        {messages.map((msg, i) => {
          const { senderId, senderName, message, timestamp } = msg;
          return (
            <ChatMessage
              key={`chat_item_${i}`}
              {...{ senderId, senderName, text: message, timestamp }}
            />
          );
        })}
      </div>
    </div>
  ) : (
    <p>No messages</p>
  );
};

export function ChatPanel({ panelHeight }) {
  const inputHeight = 72;
  const listHeight = panelHeight - inputHeight;

  return (
    <div>
      <ChatMessages listHeight={listHeight} />
      <ChatInput inputHeight={inputHeight} />
    </div>
  );
}
