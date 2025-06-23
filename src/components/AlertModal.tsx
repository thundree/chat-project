import React from "react";
import GenericModal from "@/components/GenericModal";

interface AlertModalProps {
  show: boolean;
  onClose: () => void;
  children: React.ReactNode;
  okText?: string;
}

export default function AlertModal({
  show,
  onClose,
  children,
  okText = "OK",
}: Readonly<AlertModalProps>) {
  return (
    <GenericModal show={show} onClose={onClose} cancelText={okText}>
      <div className="flex flex-col items-center justify-center">
        <div className="flex-1 text-gray-800 dark:text-white mb-4">
          {children}
        </div>
      </div>
    </GenericModal>
  );
}
