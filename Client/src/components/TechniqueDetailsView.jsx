import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Badge, ListGroup, Card, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { Tags, JournalText, PencilSquare, Diagram2, Clock } from 'react-bootstrap-icons';
import { fetchTechniqueById, updateTechnique } from '../store/slices/techniquesSlice';
import TechniqueModal from './TechniqueModal';

export default function TechniqueDetailsView() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { currentTechnique, status, error } = useSelector((state) => state.techniques);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        dispatch(fetchTechniqueById(id));
    }, [dispatch, id]);

    const handleEditClick = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleSaveTechnique = async (updatedTechnique) => {
        try {
            await dispatch(updateTechnique(updatedTechnique)).unwrap();
            setShowModal(false);
        } catch (err) {
            console.error('Failed to save the technique:', err);
        }
    };

    if (status === 'loading') return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!currentTechnique) return null;

    const sanitizedDescription = DOMPurify.sanitize(currentTechnique.description);

    return (
        <Container>
            <Card className="mb-4 shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center bg-primary text-white">
                    <h2 className="mb-0">Technique Details</h2>
                    <Button variant="light" onClick={handleEditClick}><PencilSquare /></Button>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={6}>
                            <ListGroup variant="flush">
                                <ListGroup.Item>
                                    <Diagram2 className="me-2" />
                                    <strong>Name:</strong> {currentTechnique.name}
                                </ListGroup.Item>
                            </ListGroup>
                        </Col>
                        <Col md={6}>
                            <Card className="h-100">
                                <Card.Header>
                                    <Tags className="me-2" />
                                    <strong>Tags</strong>
                                </Card.Header>
                                <Card.Body>
                                    {currentTechnique.tags && currentTechnique.tags.map(tag => (
                                        <Badge key={tag._id} bg="secondary" className="me-1 mb-1">{tag.name}</Badge>
                                    ))}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Card className="mb-4 shadow-sm">
                <Card.Header className="bg-primary text-white">
                    <JournalText className="me-2" />
                    <strong>Description</strong>
                </Card.Header>
                <Card.Body>
                    <div dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />
                </Card.Body>
            </Card>

            {currentTechnique.steps && currentTechnique.steps.length > 0 && (
                <Card className="mb-4 shadow-sm">
                    <Card.Header className="bg-primary text-white">
                        <h4 className="mb-0">Steps</h4>
                    </Card.Header>
                    <Card.Body>
                        <ListGroup variant="flush">
                            {currentTechnique.steps.map((step, index) => (
                                <ListGroup.Item key={index}>
                                    <strong>{index + 1}.</strong> {step}
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card.Body>
                </Card>
            )}

            <TechniqueModal
                show={showModal}
                handleClose={handleCloseModal}
                handleSave={handleSaveTechnique}
                technique={currentTechnique}
            />
        </Container>
    );
}