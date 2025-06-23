import { Modal, ModalHeader, ModalBody, ModalFooter } from "flowbite-react";
import type { ReactNode } from "react";
import CustomButton from "@/components/CustomButton";

export type GenericModalProps = Readonly<{
  show: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title?: ReactNode;
  children?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
  loading?: boolean;
}>;

export default function GenericModal({
  show,
  onClose,
  onConfirm,
  title,
  children,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "primary",
  loading = false,
}: GenericModalProps) {
  const showButtons = !!onClose || !!onConfirm;
  const centerButtons = !onConfirm;

  return (
    <Modal show={show} onClose={onClose}>
      {title && <ModalHeader>{title}</ModalHeader>}
      <ModalBody>{children}</ModalBody>

      {showButtons && (
        <ModalFooter>
          <div
            className={`w-full flex gap-12 ${
              centerButtons ? "justify-center" : "justify-end"
            }`}
          >
            {!!onConfirm && (
              <CustomButton
                color={confirmColor}
                onClick={onConfirm}
                disabled={loading}
              >
                {confirmText}
              </CustomButton>
            )}
            {!!onClose && (
              <CustomButton variant="gray" onClick={onClose} disabled={loading}>
                {cancelText}
              </CustomButton>
            )}
          </div>
        </ModalFooter>
      )}
    </Modal>
  );
}
