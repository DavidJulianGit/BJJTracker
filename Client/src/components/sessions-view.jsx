import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Table, Alert } from 'react-bootstrap';
import { PencilSquare, XSquareFill, Plus, XSquare,   } from 'react-bootstrap-icons';
import TrainingSessionModal from './TrainingSessionModal';
import '../css/custom.css';

export default function TrainingSessionsView() {
  const [showModal, setShowModal] = useState(false);
  const [trainingSessions, setTrainingSessions] = useState([]);
  const [editingSession, setEditingSession] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'ascending' });


  useEffect(() => {
    fetchTrainingSessions();

  }, []);

  const fetchTrainingSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/trainingSessions', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`);
      }
      const data = await response.json();
      console.log('Fetched training sessions:', data);
      setTrainingSessions(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching training sessions:', error);
      setError(`Failed to fetch training sessions: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const sortedSessions = React.useMemo(() => {
    let sortableSessions = [...trainingSessions];
    if (sortConfig.key) {
      sortableSessions.sort((a, b) => {
        if (sortConfig.key === 'date') {
          return new Date(a.date) - new Date(b.date);
        }
        if (sortConfig.key === 'time') {
          return a.time.localeCompare(b.time);
        }
        if (sortConfig.key === 'totalDuration') {
          return a.totalDuration - b.totalDuration;
        }
        return 0;
      });

      if (sortConfig.direction === 'descending') {
        sortableSessions.reverse();
      }
    }
    return sortableSessions;
  }, [trainingSessions, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getHeaderStyle = (columnName) => {
    if (sortConfig.key === columnName) {
      return {
        backgroundColor: '#CCE0FC',
        color: '#0D6EFD',
        cursor: 'pointer'
      };
    }
    return { cursor: 'pointer' };
  };

  const handleEditSession = (session) => {
    setEditingSession(session);
    setShowModal(true);
  };

  const handleDeleteSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/trainingSessions/${sessionId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) {
          throw new Error('Failed to delete session');
        }
        setTrainingSessions(trainingSessions.filter(session => session._id !== sessionId));
      } catch (error) {
        console.error('Error deleting session:', error);
        setError(`Failed to delete session: ${error.message}`);
      }
    }
  };

  const handleSaveSession = async (sessionData) => {
    try {
      const url = editingSession
        ? `http://localhost:5000/api/trainingSessions/${editingSession._id}`
        : 'http://localhost:5000/api/trainingSessions';
      const method = editingSession ? 'PUT' : 'POST';

      // Prepare the data to be sent
      const dataToSend = {
        ...sessionData,
        techniques: sessionData.techniques.map(tech => ({
          technique: tech.technique,
          duration: tech.duration,
          repetitions: tech.repetitions
        }))
      };

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(dataToSend)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const savedSession = await response.json();
      
      if (editingSession) {
        setTrainingSessions(trainingSessions.map(session => 
          session._id === savedSession._id ? savedSession : session
        ));
      } else {
        setTrainingSessions([...trainingSessions, savedSession]);
      }
      
      setShowModal(false);
      setEditingSession(null);
      // Refresh the training sessions after saving
      fetchTrainingSessions();
    } catch (error) {
      console.error('Error saving session:', error);
      setError(`Failed to save session: ${error.message}`);
    }
  };


  return (
    <Container>
      <Row className="justify-content-between align-items-center mb-4">
        <Col>
          <h2>Training Sessions</h2>
        </Col>
        <Col xs="auto">
          <Button onClick={() => setShowModal(true)}><Plus size={20} /></Button>
        </Col>
      </Row>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Table striped bordered hover >
          <thead>
            <tr>
              <th onClick={() => requestSort('date')} style={{...getHeaderStyle('date'), width: 'auto'}}>
                Date
              </th>
              <th onClick={() => requestSort('time')} style={{...getHeaderStyle('time'), width: 'auto'}}>
                Time
              </th>
              <th onClick={() => requestSort('totalDuration')} style={{...getHeaderStyle('totalDuration'), width: 'auto'}}>
                Duration 
              </th>
              <th style={{width: '40%'}}>Tags</th>
              <th style={{width: 'auto'}}></th>
            </tr>
          </thead>
          <tbody>
            {sortedSessions.map(session => (
              <tr key={session._id} className=''>
                <td className='align-middle'>{new Date(session.date).toLocaleDateString()}</td>
                <td className='align-middle'>{session.time}</td>
                <td className='align-middle'>{session.totalDuration}</td>
                <td className='align-middle'>{session.tags.map(tag => tag.name).join(', ')}</td>
                <td className="d-flex justify-content-evenly align-items-center">
                  <Button variant="outline-primary" className='align-middle border-0 p-1 me-2' onClick={() => handleEditSession(session)}>
                    <PencilSquare size={20} />
                  </Button>
                  <Button variant="" className='align-middle border-0 p-1' onClick={() => handleDeleteSession(session._id)}>
                    <XSquare size={20} className='text-danger' />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
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
    </Container>
  );
}