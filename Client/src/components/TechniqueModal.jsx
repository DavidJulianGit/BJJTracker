import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, InputGroup, ListGroup, Alert } from 'react-bootstrap';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Plus, X } from 'react-bootstrap-icons';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTags } from '../store/slices/tagsSlice';
import { updateTechnique, createTechnique, restoreTechnique, replaceTechnique } from '../store/slices/techniquesSlice';
import ConfirmationModal from './ConfirmationModal';


const TechniqueModal = ({ show, handleClose, technique }) => {
    const dispatch = useDispatch();
    const { items: tags } = useSelector((state) => state.tags);
    const [formData, setFormData] = useState({ name: '', description: '', tags: [] });
    const [tagSearchTerm, setTagSearchTerm] = useState('');
    const [addedTags, setAddedTags] = useState([]);
    const [error, setError] = useState('');
    const [showConflictModal, setShowConflictModal] = useState(false);
    const [conflictTechniqueId, setConflictTechniqueId] = useState(null);

    useEffect(() => {
        dispatch(fetchTags());
    }, [dispatch]);

    useEffect(() => {
        if (technique) {
            setFormData({
                name: technique.name,
                description: technique.description,
                tags: technique.tags
            });
            setAddedTags(technique.tags.map(tag => tag._id));
        } else {
            setFormData({ name: '', description: '', tags: [] });
            setAddedTags([]);
        }
        setError('');
    }, [technique]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDescriptionChange = (event, editor) => {
        const data = editor.getData();
        setFormData(prev => ({ ...prev, description: data }));
    };

    const handleAddTag = (tagId) => {
        if (!addedTags.includes(tagId)) {
            setAddedTags(prev => [...prev, tagId]);
        }
    };

    const handleRemoveTag = (tagId) => {
        setAddedTags(prev => prev.filter(id => id !== tagId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let resultAction;
            // if technique is passed in, we are updating
            if (technique) {
                console.log("technique in handleSubmit in TechniqueModal.jsx",technique);
                resultAction = await dispatch(updateTechnique({ ...formData, tags: addedTags, _id: technique._id }));
            }
            // if no technique is passed in, we are creating
            else {
                resultAction = await dispatch(createTechnique({ ...formData, tags: addedTags }));
            }

            console.log("resultAction in handleSubmit in TechniqueModal.jsx",resultAction);

            // if the resultAction is a fulfilled action, we close the modal
            if (updateTechnique.fulfilled.match(resultAction) || createTechnique.fulfilled.match(resultAction)) {
                handleClose();
            } 
            // if the resultAction is a conflict, we show the conflict modal
            else if (resultAction.payload && resultAction.payload.conflict) {
                setConflictTechniqueId(resultAction.payload.existingTechniqueId);
                setShowConflictModal(true);
            } 
            // if the resultAction is an error, we set the error
            else {
                throw new Error(resultAction.payload.message || 'Failed to save technique');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRestore = async () => {
        try {
            console.log("conflictTechniqueId in handleRestore in TechniqueModal.jsx",conflictTechniqueId);
            await dispatch(restoreTechnique(conflictTechniqueId)).unwrap();
            setShowConflictModal(false);
            handleClose();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleReplace = async () => {
        try {
            console.log("conflictTechniqueId in handleReplace in TechniqueModal.jsx",conflictTechniqueId);
            console.log("formData in handleReplace in TechniqueModal.jsx",formData);
            console.log("addedTags in handleReplace in TechniqueModal.jsx",addedTags);
            await dispatch(replaceTechnique({ ...formData, tags: addedTags, _id: conflictTechniqueId, idOfTechniqueToReplace: technique._id })).unwrap();
            setShowConflictModal(false);
            handleClose();
        } catch (err) {
            setError(err.message);
        }
    };

    const filteredTags = tags
        .filter(tag => !tag.isDeleted)
        .filter(tag => tag.name.toLowerCase().includes(tagSearchTerm.toLowerCase()));

    return (
        <>
            <Modal backdrop="static" show={show} onHide={handleClose} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{technique ? 'Edit Technique' : 'Add Technique'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                disabled={technique?.isDefault}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <CKEditor
                                editor={ClassicEditor}
                                data={formData.description}
                                onChange={handleDescriptionChange}
                                config={{
                                    height: '300px',
                                    toolbar: {
                                        items: [
                                            'heading',
                                            'bold',
                                            'italic',
                                            'bulletedList',
                                            'numberedList',    
                                            'blockQuote'
                                        ]
                                    }
                                }}
                            />
                        </Form.Group>
                        {/* Tags */}
                        {/* Search for tags */}
                        <Form.Group className="mb-3">
                            <Form.Label>Search Tags</Form.Label>
                            <InputGroup>
                                <Form.Control
                                    type="text"
                                    placeholder="Search for tags"
                                    value={tagSearchTerm}
                                    onChange={(e) => setTagSearchTerm(e.target.value)}
                                />
                                <Button variant="outline-secondary" onClick={() => setTagSearchTerm('')}><X /></Button>
                            </InputGroup>
                            <ListGroup className="mt-2 px-3">
                                {tagSearchTerm && filteredTags.map(tag => (
                                    <ListGroup.Item action key={tag._id} onClick={() => {handleAddTag(tag._id), setTagSearchTerm('')}} className="d-flex justify-content-between align-items-center py-1" style={{cursor: 'pointer'}}>
                                        {tag.name}                                 
                                        <Plus size={20} className="text-success"/>
                                    </ListGroup.Item>
                                )) }
                            </ListGroup>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Added Tags</Form.Label>
                            <ListGroup className="mt-1 px-3">
                                {addedTags.length > 0 ? addedTags.map(tagId => {
                                    const tag = tags.find(t => t._id === tagId);
                                    return (
                                        <ListGroup.Item key={tagId}  className="d-flex justify-content-between align-items-center py-1" >
                                            {tag?.name} 
                                            <Button variant="outline-danger" onClick={() => handleRemoveTag(tagId)} className="p-0 border-0">
                                                <X  className="outline-danger"size={20}/>
                                            </Button>
                                        </ListGroup.Item>
                                    );
                                }) : <p className='text-center'>No tags added</p>}
                            </ListGroup>
                        </Form.Group>
                        <Button type="submit">{technique ? 'Update Technique' : 'Save Technique'}</Button>
                    </Form>
                </Modal.Body>
            </Modal>

            <ConfirmationModal
                show={showConflictModal}
                handleClose={() => setShowConflictModal(false)}
                title="Technique Conflict"
                message={`A technique with the name '${formData.name}' was previously deleted. What would you like to do?`}
                showConfirmButton={true}
                confirmButtonText="Restore Old Technique"
                handleConfirm={handleRestore}
            />
        </>
    );
};

export default TechniqueModal;
