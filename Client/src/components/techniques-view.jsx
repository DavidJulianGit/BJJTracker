import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form, Button, InputGroup, Modal, ListGroup } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Plus, X, Pencil } from 'react-bootstrap-icons';
import DOMPurify from 'dompurify';
import '../css/custom.css';

export default function TechniquesView() {
	const { user } = useAuth();
	const [techniques, setTechniques] = useState([]);
	const [tags, setTags] = useState([]);
	const [formData, setFormData] = useState({ name: '', description: '', tags: [] });
	const [filterTerm, setFilterTerm] = useState('');
	const [showModal, setShowModal] = useState(false);
	const [addedTags, setAddedTags] = useState([]); 
	const [tagSearchTerm, setTagSearchTerm] = useState('');
	const [selectedTechnique, setSelectedTechnique] = useState(null); 
	const [isEditing, setIsEditing] = useState(false); 
	const quillRef = useRef(null);

	useEffect(() => {
		if (user) {
			
			fetchTechniques();
			fetchTags();
		}
		else {
			console.log("No user found");
			navigate('/login');
		}
	}, [user]);

	const fetchTechniques = async () => {
		const response = await fetch('http://localhost:5000/api/techniques', {
			headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
		});
		const data = await response.json();
		if (Array.isArray(data)) {
			console.log("fetchTechniques: ", data);
			setTechniques(data);
		} else {
			console.error('Expected an array but got:', data);
			setTechniques([]);
		}
	};

	const fetchTags = async () => {
		const response = await fetch('http://localhost:5000/api/tags', {
			headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
		});
		const data = await response.json();
		console.log("fetchTags: ", data);
		setTags(data);
	};

	const handleTagSearchChange = (e) => {
		setTagSearchTerm(e.target.value);
	};

	const handleAddTag = (tagId) => {
		if (!addedTags.includes(tagId)) {
			setAddedTags(prevTags => [...prevTags, tagId]);
		}
	};

	const handleRemoveTag = (tagId) => {
		setAddedTags(prevTags => prevTags.filter(tag => tag !== tagId));
	};

	const handleOpenModal = (technique = null) => {
		if (technique) {
			setSelectedTechnique(technique);
			const tagIds = technique.tags.map(tag => tag._id);
			setAddedTags(tagIds); 
			setFormData({
				name: technique.name, 
				description: technique.description,
				tags: technique.tags 
			});
			setIsEditing(true);
		} else {
			setFormData({ name: '', description: '', tags: [] });
			setAddedTags([]);
			setIsEditing(false);
		}
		setShowModal(true);
	};

	const handleModalClose = () => {
		setShowModal(false);
		setSelectedTechnique(null);
		setIsEditing(false);
		setAddedTags([]);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const sanitizedDescription = DOMPurify.sanitize(formData.description);
		const techniqueData = {
			name: formData.name,
			description: sanitizedDescription,
			tags: addedTags
		};

		const response = isEditing
			? await fetch(`http://localhost:5000/api/techniques/${selectedTechnique._id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				},
				body: JSON.stringify(techniqueData)
			})
			: await fetch('http://localhost:5000/api/techniques', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				},
				body: JSON.stringify(techniqueData)
			});

		if (response.ok) {
			const newTechnique = await response.json();
			if (isEditing) {
				setTechniques(prevTechniques => 
					prevTechniques.map(technique => 
						technique._id === newTechnique._id ? newTechnique : technique
					)
				);
			} else {
				setTechniques(prevTechniques => [...prevTechniques, newTechnique]);
			}
			handleModalClose(); 
		} else {
			const errorData = await response.json();
			console.error('Failed to save technique:', response.statusText, errorData);
		}
	};

	const filteredTechniques = techniques.filter(technique =>
		technique.name.toLowerCase().includes(filterTerm.toLowerCase())
	);

	const filteredTags = tagSearchTerm ? tags.filter(tag =>
		tag.name.toLowerCase().includes(tagSearchTerm.toLowerCase())
	) : [];

	return (
		<Container>
			<Row className="align-items-center">
				<Col className='my-4'>
					<h1>Manage Techniques</h1>
				</Col>
				<Col xs="auto">
					<Button onClick={() => handleOpenModal()}><Plus size={20} /></Button>
				</Col>
			</Row>
			<InputGroup className="my-4">
				<Form.Control
					type="text"
					placeholder="Filter Techniques"
					value={filterTerm}
					onChange={(e) => setFilterTerm(e.target.value)}
				/>
				<Button variant="outline-secondary" onClick={() => setFilterTerm('')}><X /></Button>
			</InputGroup>
			<ListGroup>
				{filteredTechniques.sort((a, b) => a.name.localeCompare(b.name)).map(technique => (
					<ListGroup.Item key={technique._id} className="d-flex justify-content-between align-items-center">
						<Col>
							<Link className="text-decoration-none" to={`/techniques/${technique._id}`}>
								{technique.name}
							</Link>
						</Col>
						<Col xs="auto">
							<Button variant="outline-secondary" onClick={() => handleOpenModal(technique)}>
								<Pencil size={20} />
							</Button>
						</Col>
					</ListGroup.Item>
				))}
			</ListGroup>

			{/* Combined Add/Edit Technique Modal */}
			<Modal show={showModal} onHide={handleModalClose}>
				<Modal.Header closeButton>
					<Modal.Title>{isEditing ? 'Edit Technique' : 'Add Technique'}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form onSubmit={handleSubmit}>
						<Form.Group className="mb-3">
							<Form.Label>Name</Form.Label>
							<Form.Control
								type="text"
								name="name"
								value={formData.name} 
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								required
							/>
						</Form.Group>
						<Form.Group className="mb-3">
							<Form.Label>Description</Form.Label>
							<ReactQuill
								ref={quillRef}
								value={formData.description} 
								onChange={(value) => setFormData({ ...formData, description: value })}
							/>
						</Form.Group>
						<Form.Group className="mb-3">
							<Form.Label>Search Tags</Form.Label>
							<InputGroup>
								<Form.Control
									type="text"
									placeholder="Search for tags"
									value={tagSearchTerm}
									onChange={handleTagSearchChange}
								/>
								<Button variant="outline-secondary" onClick={() => setTagSearchTerm('')}><X /></Button>	
							</InputGroup>
							<ListGroup className="mt-2">
								{filteredTags.sort((a, b) => a.name.localeCompare(b.name)).map(tag => (
									<ListGroup.Item key={tag._id} className="d-flex justify-content-between align-items-center py-1">
										{tag.name}
										<Button variant="outline-primary" onClick={() => handleAddTag(tag._id)} className="p-0 border-0">
											<Plus size={20} />
										</Button>
									</ListGroup.Item>
								))}
							</ListGroup>
						</Form.Group>
						<Form.Group className="mb-3">
							<Form.Label>Added Tags</Form.Label>
							<ListGroup>
								{addedTags && tags && addedTags.map((tagId, index) => {
									const tag = tags.find(t => t._id === tagId);
									return (
										<ListGroup.Item key={index + tagId} className="d-flex justify-content-between align-items-center py-1">
											{tag.name}
											<Button variant="outline-danger" onClick={() => handleRemoveTag(tag._id)} className="p-0 border-0">
												<X size={20} />
											</Button>
										</ListGroup.Item>
									);
								})}
							</ListGroup>
						</Form.Group>
						<Button type="submit">{isEditing ? 'Update Technique' : 'Save Technique'}</Button>
					</Form>
				</Modal.Body>
			</Modal>
		</Container>
	);
}