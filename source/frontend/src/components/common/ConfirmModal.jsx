import React from "react";
import Modal from "../ui/Modal";

const ConfirmModal = ({ isOpen, onClose, onConfirm, message }) => {
    return (
        <Modal
            isOpen={isOpen}
            title="Confirm deletion"
            onClose={onClose}
            onConfirm={onConfirm}
            confirmLabel="Delete"
        >
            <p>{message}</p>
        </Modal>
    );
};

export default ConfirmModal;