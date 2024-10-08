import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, ListGroup, InputGroup, Container, Row, Col, Badge } from 'react-bootstrap';
import { Plus, X } from 'react-bootstrap-icons';

export default function TrainingSessionModal({ show, handleClose, handleSave, editingSession }) {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    totalDuration: 0,
    techniques: [],
    note: '',
    tags: []
  });
  const [techniques, setTechniques] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTechniques, setFilteredTechniques] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [filteredTags, setFilteredTags] = useState([]);

  useEffect(() => { 
    fetchTechniques();
    fetchTags();
  }, []);

  useEffect(() => {
    
    if (editingSession) {
      setFormData({
        date: new Date(editingSession.date).toISOString().split('T')[0],
        time: editingSession.time,
        totalDuration: editingSession.totalDuration,
        techniques: editingSession.techniques.map(tech => ({
          technique: tech.technique._id,
          name: tech.technique.name,
          duration: tech.duration,
          repetitions: tech.repetitions
        })),
        note: editingSession.note,
        tags: editingSession.tags.map(tag => ({
          _id: tag._id,
          name: tag.name
        }))
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        time: '',
        totalDuration: 0,
        techniques: [],
        note: '',
        tags: []
      });
    }
  }, [editingSession]);

  useEffect(() => {
    const filtered = techniques.filter(technique =>
      technique.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTechniques(filtered);
  }, [searchTerm, techniques]);

  useEffect(() => {
    const filtered = tags.filter(tag =>
      tag.name.toLowerCase().includes(tagSearchTerm.toLowerCase())
    );
    setFilteredTags(filtered);
  }, [tagSearchTerm, tags]);

  const fetchTags = async () => {
		const response = await fetch('http://localhost:5000/api/tags', {
			headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
		});
		const data = await response.json();
		console.log("fetched Tags: ", data);
		setTags(data);
	};

  const fetchTechniques = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/techniques', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setTechniques(data);
    } catch (error) {
      console.error('Error fetching techniques:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddTechnique = (technique, event) => {
    // Prevent the click from propagating to the modal backdrop
    event.preventDefault();

    setFormData(prevData => ({
      ...prevData,
      techniques: [...prevData.techniques, { 
        technique: technique._id,
        name: technique.name,
        duration: '', 
        repetitions: '' 
      }]
    }));
  };
  
  const handleAddTag = (tag, event) => {
    // Prevent the click from propagating to the modal backdrop
    event.preventDefault();

    if (!formData.tags.some(t => t._id === tag._id)) {
      setFormData(prevData => ({
        ...prevData,
        tags: [...prevData.tags, tag]
      }));
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData(prevData => ({
      ...prevData,
      tags: prevData.tags.filter(t => t._id !== tag._id)
    }));
  };

  const handleTechniqueChange = (index, field, value) => {
    setFormData(prevData => {
      const updatedTechniques = [...prevData.techniques];
      updatedTechniques[index][field] = parseInt(value, 10) || 0;
      return { ...prevData, techniques: updatedTechniques };
    });
  };

  const handleRemoveTechnique = (techniqueId) => {
    setFormData(prevData => ({
      ...prevData,
      techniques: prevData.techniques.filter(t => t.technique !== techniqueId)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSave(formData);
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{editingSession ? 'Edit Training Session' : 'Add Training Session'}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Form onSubmit={handleSubmit}>
          {/* Date */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">Date</Form.Label>
            <Form.Control
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          {/* Time */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">Time</Form.Label>
            <Form.Control
              type="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          {/* Total Duration */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">Total Duration [min]</Form.Label>
            <Form.Control
              type="number"
              name="totalDuration"
              value={formData.totalDuration}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          {/* Search Techniques */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">Search Techniques</Form.Label>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Search for techniques"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="outline-primary" onClick={() => setSearchTerm('')} ><X size={20} /></Button>
            </InputGroup>
            {/* filtered Techniques List */}
            <ListGroup className="mt-2 px-2">
              {searchTerm && filteredTechniques.map(technique => (
                <ListGroup.Item action key={technique._id} onClick={(e) => handleAddTechnique(technique, e)} style={{cursor: 'pointer'}}>
                  <Row>
                    <Col>{technique.name}</Col>
                    <Col xs="auto">
                      <Plus size={20} className='text-primary' />
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Form.Group>
          {/* Added Techniques */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">Added Techniques</Form.Label>
            
              {formData.techniques.length > 0 ? formData.techniques.map((tech, index) => (
                <Container key={index} className="mb-3 border border-light-subtle rounded ">
                  <Row className='border-bottom border-light-subtle p-2 bg-light'>
                    <Col className="align-middle p-0">
                      {tech.name} 
                    </Col>
                    <Col xs="auto" className="p-0">
                      <Button variant="outline-danger" onClick={() => handleRemoveTechnique(tech.technique)} className="p-0"><X size={20} /></Button>
                    </Col>
                  </Row>
                  <Row className='pb-2'>
                    <Col xs={12} className="my-2">
                      <Row>
                        <Col xs={3} className="align-self-center ps-2">
                          Duration
                        </Col>
                        <Col xs={9} className="pe-2">
                          <Form.Control
                            type="number"
                            value={tech.duration}
                            onChange={(e) => handleTechniqueChange(index, 'duration', e.target.value)}
                          />
                        </Col>
                      </Row>
                    </Col>
                    <Col xs={12}>
                      <Row>
                        <Col xs={3} className="align-self-center ps-2">
                            Reps
                        </Col>
                        <Col xs={9} className="pe-2">
                          <Form.Control
                            type="number"
                            value={tech.repetitions}
                            onChange={(e) => handleTechniqueChange(index, 'repetitions', e.target.value)}
                          />
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Container>
              )) : <p className='text-center my-3 text-secondary'>No techniques added</p>}
          </Form.Group>

          {/* Tags */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">Tags</Form.Label>
            {/* Search Tags */}
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Search for tags"
                value={tagSearchTerm}
                onChange={(e) => setTagSearchTerm(e.target.value)}
              />
              <Button variant="outline-primary" onClick={() => setTagSearchTerm('')} ><X size={20} /></Button>
            </InputGroup>
            {/* Filtered Tags List */}
            <ListGroup className="mt-2 mb-4 px-2">
              {tagSearchTerm && filteredTags.slice(0, 5).map(tag => (
                <ListGroup.Item action key={tag._id} onClick={(e) => handleAddTag(tag, e)} style={{cursor: 'pointer'}}>
                  <Row>
                    <Col>{tag.name}</Col>
                    <Col xs="auto">
                      <Plus size={20} className='text-primary' />
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
            {/* Added Tags */}  
            {formData.tags.length > 0 ? formData.tags.map(tag => (
              <Badge key={tag._id} bg='secondary' className="m-1 pe-1 text-white">{tag.name}<X size={20} onClick={() => handleRemoveTag(tag)} className="p-0" style={{cursor: 'pointer'}} /></Badge>
            )) : <p className='text-center my-3 text-secondary'>No tags added</p>}
          </Form.Group>
          {/* Note */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Note</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              name="note"
              value={formData.note}
              onChange={handleInputChange}
            />
          </Form.Group>
          <Button type="submit">{editingSession ? 'Update Session' : 'Save Session'}</Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}