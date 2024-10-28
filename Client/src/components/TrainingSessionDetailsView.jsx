import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTrainingSessions, saveTrainingSession } from '../store/slices/trainingSessionsSlice';
import { Container, Row, Col, Button, Card, Badge, ListGroup } from 'react-bootstrap';
import TrainingSessionModal from './TrainingSessionModal';
import moment from 'moment';
import { Clock, Calendar3, Stopwatch, Tags, JournalText, PencilSquare } from 'react-bootstrap-icons';

const TrainingSessionDetailsView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: trainingSessions, status } = useSelector((state) => state.trainingSessions);
  const [session, setSession] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTrainingSessions());
    }
  }, [status, dispatch]);

  useEffect(() => {
    const currentSession = trainingSessions.find(s => s._id === id);
    setSession(currentSession);
  }, [trainingSessions, id]);

  const handleEditClick = () => {
    setShowModal(true);
  };

  const handleSaveSession = async (updatedSessionData) => {
    try {
      await dispatch(saveTrainingSession(updatedSessionData)).unwrap();
      setShowModal(false);
      dispatch(fetchTrainingSessions());
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  if (!session) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <Card className="mb-4 shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center bg-primary text-white">
          <h2 className="mb-0">Training Session Details</h2>
          <Button variant="light" onClick={handleEditClick}><PencilSquare /></Button>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Calendar3 className="me-2" />
                  <strong>Date:</strong> {moment(session.date).format('MMMM D, YYYY')}
                </ListGroup.Item>
                <ListGroup.Item>
                  <Clock className="me-2" />
                  <strong>Time:</strong> {session.time}
                </ListGroup.Item>
                <ListGroup.Item>
                  <Stopwatch className="me-2" />
                  <strong>Duration:</strong> {session.totalDuration} minutes
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
                  {session.tags.map(tag => (
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
          <h4 className="mb-0">Techniques</h4>
        </Card.Header>
        <Card.Body>
          <ListGroup variant="flush">
            {session.techniques.map(tech => (
              <ListGroup.Item key={tech._id} className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{tech.technique.name}</strong>
                </div>
                <div>
                  {tech.duration && <Badge bg="primary" className="me-2">Duration: {tech.duration} min</Badge>} 
                  {tech.repetitions && <Badge bg="secondary">Reps: {tech.repetitions}</Badge>}
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>

      {session.note && (
        <Card className="mb-4 shadow-sm">
          <Card.Header className="bg-primary text-white">
            <JournalText className="me-2" />
            <strong>Notes</strong>
          </Card.Header>
          <Card.Body>
            <p className="mb-0">{session.note}</p>
          </Card.Body>
        </Card>
      )}

      <TrainingSessionModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        handleSave={handleSaveSession}
        editingSession={session}
      />
    </Container>
  );
};

export default TrainingSessionDetailsView;