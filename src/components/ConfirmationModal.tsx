import React from "react";
import GenericModal from "@/components/GenericModal";

interface ConfirmationModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  children: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  title?: React.ReactNode;
  confirmColor?: string;
  loading?: boolean;
}

export default function ConfirmationModal({
  show,
  onClose,
  onConfirm,
  children,
  confirmText = "Confirm",
  cancelText = "Cancel",
  title,
  confirmColor = "primary",
  loading = false,
}: Readonly<ConfirmationModalProps>) {
  return (
    <GenericModal
      show={show}
      onClose={onClose}
      onConfirm={onConfirm}
      confirmText={confirmText}
      cancelText={cancelText}
      title={title}
      confirmColor={confirmColor}
      loading={loading}
    >
      <div className="flex flex-col items-center justify-center">
        <div className="flex-1 text-gray-800 dark:text-white mb-4">
          {children}
        </div>
      </div>
    </GenericModal>
  );
}
