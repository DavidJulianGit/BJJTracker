import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTrainingSessions, saveTrainingSession, deleteTrainingSession } from '../store/slices/trainingSessionsSlice';
import { Container, Row, Col, Button, Alert, ButtonGroup, Badge, Spinner } from 'react-bootstrap';
import { Plus, Calendar, List, CalendarWeekFill, ClockFill, StopwatchFill, TagsFill, ArrowDownCircle } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import TrainingSessionModal from './TrainingSessionModal';
import ConfirmationModal from './ConfirmationModal';
import CalendarView from './CalendarView';
import SortableTable from './SortableTable';
import '../css/custom.css';

export default function TrainingSessionsView() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: trainingSessions, status, error } = useSelector((state) => state.trainingSessions);
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pullStartY = useRef(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTrainingSessions());
    }
  }, [status, dispatch]);

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    pullStartY.current = touch.clientY;
  };

  const handleTouchMove = async (e) => {
    const touch = e.touches[0];
    const pullMoveY = touch.clientY;
    const pullDistance = pullMoveY - pullStartY.current;

    // Only allow pull-to-refresh when at the top of the container
    if (containerRef.current.scrollTop === 0 && pullDistance > 0) {
      if (pullDistance > 70 && !isRefreshing) { // Threshold for refresh
        setIsRefreshing(true);
        try {
          await dispatch(fetchTrainingSessions()).unwrap();
        } finally {
          setIsRefreshing(false);
        }
      }
      // Prevent default to enable smooth pull effect
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    pullStartY.current = 0;
    if (isRefreshing) {
      setIsRefreshing(false);
    }
  };

  const handleEditSession = (session) => {
    setEditingSession(session);
    setShowModal(true);
  };

  const handleDeleteClick = (session) => {
    setSessionToDelete(session);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (sessionToDelete) {
      try {
        await dispatch(deleteTrainingSession(sessionToDelete._id)).unwrap();
        setShowDeleteModal(false);
        setSessionToDelete(null);
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    }
  };

  const handleSaveSession = async (sessionData) => {
    try {
      console.log("Saving session data:", sessionData);
      const resultAction = await dispatch(saveTrainingSession(sessionData));
      if (saveTrainingSession.fulfilled.match(resultAction)) {
        console.log("Session saved successfully:", resultAction.payload);
        setShowModal(false);
        setEditingSession(null);
        dispatch(fetchTrainingSessions());
      } else {
        console.error("Failed to save session:", resultAction.error);
      }
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const handleRowClick = (sessionId) => {
    navigate(`/sessions/${sessionId}`);
  };

  const columns = [
    { key: 'date', label: <CalendarWeekFill size={16} className='text-primary'/>, render: (session) => {
      const date = new Date(session.date);
      return `${date.getYear()-100}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
    } },
    { key: 'time', label: <ClockFill size={16} className='text-primary' /> },
    { key: 'totalDuration', label: <StopwatchFill size={16} className='text-primary'/> },
    { key: 'tags', label: <TagsFill size={16} className='text-primary'/>, render: (session) => (
      session.tags.map(tag => <Badge key={tag._id} bg="secondary fw-medium" className="me-1 mb-1">{tag.name}</Badge>)
    )}
  ];

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ overflowY: 'auto', height: '100vh' }}
    >
      <Container className="my-5 py-0">
        {isRefreshing && (
          <div className="text-center py-3">
            <Spinner animation="border" variant="primary" />
          </div>
        )}
        <Row className="justify-content-between align-items-center mb-4">
          <Col>
            <h2 className='display-6'>Training Sessions</h2>
          </Col>
          <Col xs="auto">
            <ButtonGroup className="me-2">
              <Button 
                variant={viewMode === 'list' ? 'primary' : 'outline-primary'} 
                onClick={() => setViewMode('list')}
              >
                <List size={20} />
              </Button>
              <Button 
                variant={viewMode === 'calendar' ? 'primary' : 'outline-primary'} 
                onClick={() => setViewMode('calendar')}
              >
                <Calendar size={18} />
              </Button>
            </ButtonGroup>
            <Button onClick={() => setShowModal(true)}><Plus size={18} /></Button>
          </Col>
        </Row>
        {error && <Alert variant="danger">{error}</Alert>}
        {(viewMode === 'list' && trainingSessions.length > 0) ? (
          <SortableTable 
            items={trainingSessions}
            columns={columns}
            onEditItem={handleEditSession}
            onDeleteItem={handleDeleteClick}
            onRowClick={handleRowClick}
          />
        ) : trainingSessions.length === 0 ? (
          <p className='text-center mt-4'>No training sessions found</p>
        ) : (
          <CalendarView />
        )}
        <TrainingSessionModal
          show={showModal}
          handleClose={() => {
            setShowModal(false);
            setEditingSession(null);
          }}
          handleSave={handleSaveSession}
          editingSession={editingSession}
        />
        <ConfirmationModal
          show={showDeleteModal}
          handleClose={() => setShowDeleteModal(false)}
          handleConfirm={handleDeleteConfirm}
          title="Confirm Deletion"
          message={`Are you sure you want to delete the training session on ${sessionToDelete ? new Date(sessionToDelete.date).toLocaleDateString() : ''}?`}
        />
      </Container>
    </div>
  );
}
