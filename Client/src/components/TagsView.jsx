import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTags, addTag, deleteTag, updateTag } from '../store/slices/tagsSlice';
import { Container, Row, Col, Form, Button, ListGroup, InputGroup, Alert } from 'react-bootstrap';
import { X,  PencilSquare, XSquare, SortAlphaDown, SortAlphaDownAlt } from 'react-bootstrap-icons';
import ConfirmationModal from './ConfirmationModal';

export default function TagsView() {
  const dispatch = useDispatch();
  const tagsState = useSelector((state) => state.tags);
  const { items: tags, status, error } = tagsState || { items: [], status: 'idle', error: null };

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTags());
    }
  }, [status, dispatch]);

  const [newTag, setNewTag] = useState('');
  const [editingTag, setEditingTag] = useState(null);
  const [filter, setFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' for ascending, 'desc' for descending
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tagToDelete, setTagToDelete] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    console.log("newTag in handleSubmit in tags-view.jsx",newTag);


    try {
      const resultAction = await dispatch(addTag(newTag));
      console.log("resultAction in handleSubmit in tags-view.jsx",resultAction);

      if (resultAction.error) {
        throw new Error(resultAction.payload);
      }

    } catch (err) {
      console.error('Failed to add the tag:', err);
      setErrorMessage(err.message);
      setShowErrorModal(true);
    }
  };

  const handleEdit = (tag) => {
    setEditingTag({ ...tag });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingTag.name.trim()) return;

    try {
      const resultAction = await dispatch(updateTag(editingTag)).unwrap();
      console.log('resultAction:', resultAction);
      if (resultAction.error) {
        throw new Error(resultAction.payload);
      }
      setEditingTag(null);
    } catch (error) {
      console.error('Error updating tag:', error);
      setErrorMessage(error);
      setShowErrorModal(true);
    }
  };

  const handleDeleteClick = (tag) => {
    setTagToDelete(tag);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (tagToDelete) {
      try {
        await dispatch(deleteTag(tagToDelete._id)).unwrap();
        setShowDeleteModal(false);
        setTagToDelete(null);
      } catch (error) {
        console.error('Error deleting tag:', error);
      }
    }
  };

  // Filter and sort tags
  const filteredTags = tags?.filter(tag => tag && !tag.isDeleted)
    .filter(tag => tag && tag.name && tag.name.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const resetFilter = () => {
    setFilter('');
  };

  return (
    <Container className="mt-5">
      <Row className="align-items-center mb-4">
        <Col>
          <h2 className='display-6'>Manage Tags</h2>
        </Col>
      </Row>
      {error && <Alert variant="danger">{error}</Alert>}
      {status === 'loading' && <p>Loading tags...</p>}
      <Row>
        <Col>
          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Label>New Tag</Form.Label>
                <InputGroup>
                    <Form.Control
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Enter new tag name"
                /> 
                <Button  type="submit">Add Tag</Button>
                </InputGroup>
            </Form.Group>
          </Form>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
            <Form.Group >
                <Form.Label className="me-2">Filter Tags</Form.Label>
                <InputGroup>
                    <Form.Control
                        type="text"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        placeholder="Filter by tag name"
                    />
                    <Button variant="outline-primary" onClick={resetFilter}>
                        <X size={20} />
                    </Button>
                </InputGroup>
          </Form.Group>
        </Col>
        <Col xs="auto" className='d-flex align-items-end'>
          <Button onClick={toggleSortOrder} className="ms-md-1 mt-2">
            {sortOrder === 'asc' ? <SortAlphaDown size={20} /> : <SortAlphaDownAlt size={20} />}
          </Button>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <ListGroup className='mx-2 my-1'>
            {filteredTags.map(tag => (
              <ListGroup.Item  key={tag._id} className="d-flex justify-content-between align-items-center">
                {editingTag && editingTag._id === tag._id ? (
                  <Form onSubmit={handleUpdate} className="w-100 d-flex">
                    <Form.Control
                      type="text"
                      value={editingTag.name}
                      onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                    />
                    <Button type="submit" size="sm" className="ms-2">Save</Button>
                    <Button variant="secondary" size="sm" className="ms-2" onClick={() => setEditingTag(null)}>Cancel</Button>
                  </Form>
                ) : (
                  <>
                    <span>{tag.name}</span>
                    <div>
                      <Button variant="" className='align-middle border-0 p-1 me-2' onClick={() => handleEdit(tag)} disabled={tag.isDefault }>
                        <PencilSquare size={18} className={tag.isDefault ? 'text-secondary' : 'text-primary'} />
                      </Button>
                      <Button variant="" className='align-middle border-0 p-1 me-2' onClick={() => handleDeleteClick(tag)} disabled={tag.isDefault }>
                        <XSquare size={18} className={tag.isDefault ? 'text-secondary' : 'text-danger'}/>
                      </Button>
                    </div>
                  </>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
      </Row>

      <ConfirmationModal
        show={showDeleteModal}
        handleClose={() => setShowDeleteModal(false)}
        handleConfirm={handleDeleteConfirm}
        title="Confirm Deletion"
        message={`Are you sure you want to delete the tag "${tagToDelete?.name}"?`}
      />

      <ConfirmationModal
        show={showErrorModal}
        handleClose={() => setShowErrorModal(false)}
        title="Error"
        message={errorMessage}
        showConfirmButton={false}
      />
    </Container>
  );
}
