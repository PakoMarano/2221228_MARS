import React from "react";

const Modal = ({ isOpen, title, children, onClose, onConfirm, confirmLabel }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h3>{title}</h3>
                    <i className="bi bi-x-lg modal-close" onClick={onClose}></i>
                </div>

                <div className="modal-body">{children}</div>

                <div className="modal-footer">
                    <button className="modal-button secondary" onClick={onClose}>
                        Cancel
                    </button>
                    {onConfirm && (
                        <button className="modal-button primary" onClick={onConfirm}>
                            {confirmLabel}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;