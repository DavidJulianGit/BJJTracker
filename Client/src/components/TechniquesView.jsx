import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTechniques, updateTechnique, deleteTechnique, createTechnique } from '../store/slices/techniquesSlice';
import { Container, Row, Col, Form, Button, InputGroup, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Plus, X, PencilSquare, XSquare } from 'react-bootstrap-icons';
import TechniqueModal from './TechniqueModal';
import ConfirmationModal from './ConfirmationModal';
import '../css/custom.css';

export default function TechniquesView() {
	const dispatch = useDispatch();
	const { items: techniques, status, error } = useSelector((state) => state.techniques);
	const [filterTerm, setFilterTerm] = useState('');
	const [showModal, setShowModal] = useState(false);
	const [selectedTechnique, setSelectedTechnique] = useState(null);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [techniqueToDelete, setTechniqueToDelete] = useState(null);
	const [showErrorModal, setShowErrorModal] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		if (status === 'idle') {
			dispatch(fetchTechniques());
		}
	}, [status, dispatch]);

	const handleOpenModal = (technique = null) => {
		setSelectedTechnique(technique);
		setShowModal(true);
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setSelectedTechnique(null);
		dispatch(fetchTechniques());
	};

	const handleSaveTechnique = async (techniqueData) => {
		try {
			let resultAction;
			if (techniqueData._id) {
				resultAction = await dispatch(updateTechnique(techniqueData));
			} else {
				resultAction = await dispatch(createTechnique(techniqueData));
			}
			
			if (updateTechnique.rejected.match(resultAction) || createTechnique.rejected.match(resultAction)) {
				throw new Error(resultAction.payload || 'An error occurred while saving the technique');
			}
			
			handleCloseModal();
		} catch (error) {
			console.error('Failed to save technique:', error);
			setErrorMessage(error.message);
			setShowErrorModal(true);
		}
	};

	const handleDeleteClick = (technique) => {
		setTechniqueToDelete(technique);
		setShowDeleteModal(true);
	};

	const handleDeleteConfirm = async () => {
		if (techniqueToDelete) {
			try {
				await dispatch(deleteTechnique(techniqueToDelete._id)).unwrap();
				setShowDeleteModal(false);
				setTechniqueToDelete(null);
			} catch (error) {
				console.error('Failed to delete technique:', error);
				setErrorMessage(error.message);
				setShowErrorModal(true);
			}
		}
	};

	const filteredTechniques = techniques
		.filter(technique => !technique.isDeleted)
		.filter(technique => technique.name.toLowerCase()
		.includes(filterTerm.toLowerCase()));

	if (status === 'loading') return <div>Loading...</div>;
	if (error) return <div>Error: {error}</div>;

	return (
		<Container className="mt-5">
			<Row className="align-items-center mb-4">
				<Col>
					<h2 className='display-6'>Manage Techniques</h2>
				</Col>
				<Col xs="auto">
					<Button variant='primary' onClick={() => handleOpenModal()}><Plus size={20} /></Button>
				</Col>
			</Row>
			<InputGroup className="mt-3 mb-2">
				<Form.Control
					type="text"
					placeholder="Filter Techniques"
					value={filterTerm}
					onChange={(e) => setFilterTerm(e.target.value)}
				/>
				<Button variant="outline-primary" onClick={() => setFilterTerm('')}><X size={20} /></Button>
			</InputGroup>
			<ListGroup className='mx-2 my-1'>
				{filteredTechniques.sort((a, b) => a.name.localeCompare(b.name)).map(technique => (
					<ListGroup.Item  key={technique._id} className="d-flex justify-content-between align-items-center">
						<Col>
							<Link className="text-decoration-none text-primary fw-semibold" to={`/techniques/${technique._id}`}>
								{technique.name}
							</Link>
						</Col>
						<Col xs="auto" className='d-flex justify-content-end'>
							<Button variant='' className='align-middle border-0 p-1 me-2' onClick={() => handleOpenModal(technique)} >
								<PencilSquare size={18} className='text-primary'/>
							</Button>
							<Button variant='' className='align-middle border-0 p-1' onClick={() => handleDeleteClick(technique)} disabled={technique.isDefault}>
								<XSquare size={18} className={technique.isDefault ? 'text-secondary' : 'text-danger'}/>
							</Button>
						</Col>
					</ListGroup.Item>
				))}
			</ListGroup>

			<TechniqueModal
				show={showModal}
				handleClose={handleCloseModal}
				handleSave={handleSaveTechnique}
				technique={selectedTechnique}
			/>

			<ConfirmationModal
				show={showDeleteModal}
				handleClose={() => setShowDeleteModal(false)}
				handleConfirm={handleDeleteConfirm}
				title="Confirm Deletion"
				message={`Are you sure you want to delete the technique "${techniqueToDelete?.name}"?`}
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
