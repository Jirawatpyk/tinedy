import React from 'react';
import Modal from './Modal';
import Button from './Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmButtonText?: string;
  confirmButtonVariant?: 'primary' | 'danger';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = 'Confirm',
  confirmButtonVariant = 'primary',
}) => {

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="text-slate-600 text-sm mb-6">{message}</div>
      <div className="flex justify-end gap-3">
        <Button
          onClick={onClose}
          variant="secondary"
          className="font-semibold"
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant={confirmButtonVariant}
          className="font-semibold"
        >
          {confirmButtonText}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;