import { FaUserAlt } from "react-icons/fa";
import type { Chat, Message } from "@/types";
import { SiNginxproxymanager } from "react-icons/si";
import { replacePlaceholders } from "@/functions";

type MessageItemProps = {
  message: Message;
  selectedChat: Chat;
  msgSender: string;
};

const replaceMessageText = (
  text: string,
  replacements: Record<string, string> | null
) => {
  if (!replacements) return text;

  return Object.entries(replacements).reduce(
    (acc, [key, value]) => acc.replace(new RegExp(key, "g"), value),
    text
  );
};

export default function MessageItem({
  message,
  selectedChat,
  msgSender,
}: Readonly<MessageItemProps>) {
  const isCharacterMessage = message.sender !== "user";

  let messageIcon;
  if (isCharacterMessage) {
    messageIcon = selectedChat?.characterImage ? (
      <img
        src={selectedChat.characterImage}
        alt={selectedChat.characterName}
        className="w-14 h-20 rounded-md overflow-hidden object-cover"
      />
    ) : (
      <FaUserAlt className="mx-auto" size={38} />
    );
  } else {
    messageIcon = <SiNginxproxymanager className="mx-auto mt-1" size={38} />;
  }

  return (
    <div
      key={`chat-message-${message.id}`}
      className="p-2 flex gap-2 bg-black/80 rounded-md"
    >
      <div className="flex-shrink-0 w-14 text-gray-800 dark:text-blue-200">
        {messageIcon}
      </div>

      <div className="flex flex-col">
        <strong className="text-blue-400">{msgSender}</strong>
        <div className="flex-1 space-y-[6px]">
          {message.text.map((text, index) => (
            <p
              key={`message-text-${message.id}-${index}`}
              className="text-gray-200"
              style={{
                color:
                  isCharacterMessage && selectedChat?.characterColor
                    ? selectedChat.characterColor
                    : "",
              }}
              dangerouslySetInnerHTML={{
                __html: replaceMessageText(
                  text,
                  replacePlaceholders(selectedChat)
                ),
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
