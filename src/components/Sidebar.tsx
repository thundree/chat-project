import {
  Sidebar as MainSidebar,
  SidebarItem,
  SidebarItemGroup,
  SidebarItems,
} from "flowbite-react";

import CustomButton from "@/components/CustomButton";
import { PiChatsBold } from "react-icons/pi";
import { IoSettings } from "react-icons/io5";

import { FaTrashCan } from "react-icons/fa6";
import { useChat } from "@/contexts/useChat";
import { useTranslation } from "@/hooks/useTranslation";
import { Suspense, useState, type ReactNode } from "react";
import ConfirmationModal from "./ConfirmationModal";
import GlobalSettingsModal from "./GlobalSettingsModal";

type SidebarProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function Sidebar({ open }: Readonly<SidebarProps>) {
  const { chats, currentChatId, deleteChat } = useChat();
  const { t } = useTranslation();

  // Confirmation modal state
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationContent, setConfirmationContent] =
    useState<ReactNode>(null);
  const [confirmationAction, setConfirmationAction] = useState<
    (() => void) | null
  >(null);

  // Global settings modal state
  const [settingsOpen, setSettingsOpen] = useState(false);

  const showConfirmation = (
    content: React.ReactNode,
    onConfirm: () => void
  ) => {
    setConfirmationContent(content);
    setConfirmationAction(() => onConfirm);
    setConfirmationOpen(true);
  };
  const closeConfirmation = () => {
    setConfirmationOpen(false);
    setConfirmationContent(null);
    setConfirmationAction(null);
  };
  const handleConfirm = () => {
    if (confirmationAction) {
      confirmationAction();
    }
    closeConfirmation();
  };

  return (
    <>
      {/* Confirmation Modal Wrapper */}
      <Suspense>
        <ConfirmationModal
          show={confirmationOpen}
          onClose={closeConfirmation}
          onConfirm={handleConfirm}
          confirmText={t("common.remove")}
          cancelText={t("common.cancel")}
        >
          {confirmationContent}
        </ConfirmationModal>
      </Suspense>

      {/* Global Settings Modal */}
      <Suspense>
        <GlobalSettingsModal
          show={settingsOpen}
          onClose={() => setSettingsOpen(false)}
        />
      </Suspense>

      <MainSidebar
        className={`fixed z-40 h-screen w-64 transition-transform duration-300 ease-in-out bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
        ${open ? "translate-x-0" : "-translate-x-full"}
        `}
        aria-label={t("sidebar.chatListLabel")}
      >
        <SidebarItems className="h-full flex flex-col">
          <SidebarItemGroup className="flex-1">
            <a className="flex w-full mb-4" href="#new-chat">
              <CustomButton
                className="flex w-full gap-3 items-center justify-start"
                variant="default"
              >
                <PiChatsBold size={24} />
                <span>{t("sidebar.newChat")}</span>
              </CustomButton>
            </a>

            {chats?.length ? (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  className="flex-1 flex justify-between items-center group"
                >
                  <a
                    className={`flex-1 flex rounded-sm pl-2 py-1 items-center truncate ellipsis ${
                      currentChatId === chat.id
                        ? "bg-gray-300 dark:bg-gray-600"
                        : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                    }`}
                    href={`#${chat.id}`}
                  >
                    <span
                      className="w-full text-gray-800 dark:text-white block truncate"
                      style={{ color: chat.characterColor }}
                    >
                      {chat.title}
                    </span>
                  </a>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      showConfirmation(
                        <p>
                          {t("sidebar.deleteConfirmation")} "{chat.title}"?
                        </p>,
                        () => {
                          deleteChat(chat.id);
                          if (currentChatId === chat.id) {
                            window.location.hash = "new-chat";
                          }
                        }
                      );
                    }}
                    className="opacity-0 ml-auto cursor-pointer group-hover:opacity-60 transition-opacity py-2 pl-3 pr-2 -mr-2 text-red-600 hover:opacity-100"
                    title={t("sidebar.deleteChat")}
                  >
                    <FaTrashCan />
                  </button>
                </div>
              ))
            ) : (
              <SidebarItem
                className="flex pl-0 items-center justify-between"
                active={false}
                onClick={() => {}}
              >
                <span className="flex text-gray-600 dark:text-gray-400">
                  {t("sidebar.noChats")}
                </span>
              </SidebarItem>
            )}
          </SidebarItemGroup>

          {/* Settings section at the bottom */}
          <SidebarItemGroup className="mt-auto">
            <CustomButton
              className="flex gap-3 items-center justify-start w-full"
              variant="default"
              onClick={() => setSettingsOpen(true)}
            >
              <IoSettings />
              <span>{t("sidebar.settings")}</span>
            </CustomButton>
          </SidebarItemGroup>
        </SidebarItems>
      </MainSidebar>
    </>
  );
}
