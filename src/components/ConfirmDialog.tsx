import React from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'react-bootstrap';
import { AlertTriangle } from 'lucide-react';
import Button from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal show={isOpen} onHide={onCancel} centered>
      <ModalHeader closeButton className={isDangerous ? 'bg-danger-light border-danger-subtle' : ''}>
        <div className="d-flex align-items-center gap-2">
          <AlertTriangle size={20} className={isDangerous ? 'text-danger' : 'text-primary'} />
          <Modal.Title className="fw-bold">{title}</Modal.Title>
        </div>
      </ModalHeader>

      <ModalBody>
        <p>{message}</p>
      </ModalBody>

      <ModalFooter className="gap-2">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          {cancelText}
        </Button>
        <Button
          variant={isDangerous ? 'danger' : 'primary'}
          onClick={onConfirm}
          loading={isLoading}
          disabled={isLoading}
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
