import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Badge, ListGroup } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';


export default function TechniqueDetailsView() {
    const { id } = useParams();
    const [technique, setTechnique] = useState(null);
    const [error, setError] = useState(null); 

    useEffect(() => {
        const fetchTechnique = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/techniques/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}` // Ensure the token is included if required
                    }
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setTechnique(data);
            } catch (error) {
                setError(error.message); // Set error message
            }
        };
        fetchTechnique();
    }, [id]);

    if (error) return <p>Error: {error}</p>; 
    if (!technique) return <p>Loading...</p>;

    const sanitizedDescription = DOMPurify.sanitize(technique.description);

    return (
        <Container>
            <Row>
                <Col>
                    <h2>{technique.name}</h2>
                    <div dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />
                    <div>Tags:
                        <ListGroup>
                            {technique.tags.map(tag => (
                                <ListGroup.Item key={tag._id} className="d-flex justify-content-between align-items-center border-0">
                                    <Badge key={tag._id} pill bg="primary" className="mr-1">{tag.name}</Badge>
                                </ListGroup.Item>
                            ))}
                        </ListGroup> 
                    </div> 
                </Col>
            </Row>
        </Container>
    );
}
