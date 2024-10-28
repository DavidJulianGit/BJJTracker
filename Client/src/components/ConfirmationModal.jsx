import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { ExclamationTriangleFill } from 'react-bootstrap-icons';

const ConfirmationModal = ({ 
  show, 
  handleClose, 
  handleConfirm, 
  title, 
  message, 
  showConfirmButton = true,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  handleCancel
}) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title className='d-flex align-items-center'>
          <ExclamationTriangleFill className={showConfirmButton ? "text-warning" : "text-danger"} />
          <span className="ms-2">{title}</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCancel || handleClose}>
          {cancelButtonText}
        </Button>
        {showConfirmButton && (
          <Button variant="primary" onClick={handleConfirm}>
            {confirmButtonText}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;
