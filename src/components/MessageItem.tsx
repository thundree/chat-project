import React from "react";
import { FaUserAlt } from "react-icons/fa";
import type { Chat, Message } from "@/types";
import { SiNginxproxymanager } from "react-icons/si";
import { replacePlaceholders } from "@/functions";

type MessageItemProps = {
  message: Message;
  selectedChat: Chat;
  msgSender: string;
  chatId?: string | null;
  updateMessage?: (
    chatId: string,
    messageId: string,
    updates: Partial<Message>
  ) => Promise<void>;
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
  chatId,
  updateMessage,
}: Readonly<MessageItemProps>) {
  const isCharacterMessage = message.sender !== "user";
  const [editing, setEditing] = React.useState(false);
  const [editText, setEditText] = React.useState(message.text.join("\n\n"));
  const [saving, setSaving] = React.useState(false);

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

  const handleEdit = () => setEditing(true);
  const handleCancel = () => {
    setEditText(message.text.join("\n\n"));
    setEditing(false);
  };
  const handleSave = async () => {
    if (!chatId || !updateMessage) return;
    setSaving(true);
    // Split by double newlines (paragraphs)
    const paragraphs = editText
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
    await updateMessage(chatId, message.id, { text: paragraphs });
    setSaving(false);
    setEditing(false);
  };

  return (
    <div
      key={`chat-message-${message.id}`}
      className="p-2 flex gap-2 bg-black/80 rounded-md"
    >
      <div className="flex-shrink-0 w-14 text-gray-800 dark:text-blue-200">
        {messageIcon}
      </div>

      <div className="flex flex-col w-full">
        <strong className="text-blue-400">{msgSender}</strong>
        <div className="flex-1 space-y-[6px]">
          {editing ? (
            <>
              <textarea
                className="w-full rounded bg-gray-800 text-gray-200 p-2 border border-gray-600 mb-2"
                rows={Math.max(6, editText.split("\n\n").length)}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                disabled={saving}
              />
              <div className="flex gap-2 mt-1">
                <button
                  className="px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700 text-xs"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  className="px-2 py-1 rounded bg-gray-600 text-white hover:bg-gray-700 text-xs"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            message.text.map((text, index) => (
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
            ))
          )}
        </div>
        {!editing && chatId && updateMessage && (
          <button
            className="cursor-pointer mt-2 text-xs text-blue-400 hover:underline self-start"
            onClick={handleEdit}
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
}
