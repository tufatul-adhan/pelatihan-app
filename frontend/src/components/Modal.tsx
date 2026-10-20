import React from 'react';
import { Modal as BsModal, ModalBody, ModalFooter, ModalHeader } from 'react-bootstrap';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  children,
  onClose,
  onConfirm,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  loading = false,
}) => {
  return (
    <BsModal show={isOpen} onHide={onClose} centered>
      <ModalHeader closeButton>
        <BsModal.Title className="fw-bold">{title}</BsModal.Title>
      </ModalHeader>

      <ModalBody>
        {children}
      </ModalBody>

      <ModalFooter className="gap-2">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </Button>
        {onConfirm && (
          <Button
            variant="primary"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        )}
      </ModalFooter>
    </BsModal>
  );
};

export default Modal;
