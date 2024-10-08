import React, { useState } from 'react';
import 'react-bootstrap'
import { Form, Row, Col, Button, InputGroup, } from 'react-bootstrap';
import { Plus, X, } from 'react-bootstrap-icons';

export default function AddSessionView() {
  const techniques = ['armbar', 'Ankle Lock', 'Hip Bump Sweep', 'Pendulum Sweep' , 'Inside HeelHook', 'Outside HeelHook', 'Rear Naked Choke', 'Bow And Arrow Choke', 'High Elbow Guillotine', ];
  const [filterTerm, setFilterTerm] = useState('');
  const [filteredTechniques, setFilteredTechniques] = useState(techniques);
  const [selectedValue, setSelectedValue] = useState('');
  const [sessionTechniques, setSessionTechniques] = useState([]);
  const [totalSessionDuration, setTotalSessionDuration] = useState()
  const [sessionDate, setSessionDate] = useState(new Date());
  

  function formatDateForInput(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-CA').format(date); // YYYY-MM-DD format
 }
  
  // Filter Techniques for Select field
  function filterTechniques(e) {
    const searchValue = e.target.value;
    setFilterTerm(searchValue);
    
    const filtered = techniques.filter(techn => 
      techn.toLowerCase().includes(searchValue.toLowerCase())
    );

    setFilteredTechniques(filtered);
  }
  function resetFilter()
  {
    setFilterTerm('')
    setFilteredTechniques(techniques)
  }
  function addTechToSession() {
    if(selectedValue) {
      
      if(sessionTechniques.every( tech => selectedValue !== tech.name))
      {
        setSessionTechniques(prev => [...prev, {'name': selectedValue, 'duration':'', 'reps':''}]);
        setSelectedValue('');
        setFilterTerm('')
      }
      return;
    }
    if(filterTerm) {
      if(sessionTechniques.every( tech => selectedValue !== tech.name))
      {
        setSessionTechniques(prev => [...prev, {'name': filterTerm, 'duration':'', 'reps':''}]);
        setFilterTerm('')
      }
    }

  }

  // update techniques duration or reps
  function updateTech(techToUpdate, e) {
    const { name, value } = e.target;
    setSessionTechniques(prevTechniques => 
      prevTechniques.map(tech => 
        tech.name === techToUpdate.name 
          ? { ...tech, [name]: value }
          : tech
      )
    );
  }

  // check if all techniques have duration or reps or both
  function checkSession()
  {
    return sessionTechniques.filter( technique => technique.duration !== '' || technique.reps !== '').length === sessionTechniques.length 
  }

  function saveSession(event)
  {
    event.preventDefault()
  
    if(checkSession())
    {
      // implement saving logic
    }
  }

  function deleteTechniqueFromSession(techniqueToDelete)
  {
    console.log(techniqueToDelete.name)
     setSessionTechniques(prevTechniques => 
      prevTechniques.filter(tech => tech.name !== techniqueToDelete.name)
    );
  }
  return (
    <div className="container mt-5">
      <Form onSubmit={saveSession}>
        <Row className=''>
          <Col xs={12} md={6} className='mb-2 mb-md-0'>
            <InputGroup>
              <InputGroup.Text>Date</InputGroup.Text>
              <Form.Control 
                type="date" 
                name="date"
                value={formatDateForInput(sessionDate)} 
                onChange={(e) => setSessionDate(e.target.value)} 
                required
              />
            </InputGroup>
          </Col>
          <Col xs={12} md={6} className='mb-md-0'>
            <InputGroup>
              <InputGroup.Text>Total duration</InputGroup.Text>
              <Form.Control 
                type="number" 
                name="totalDuration"
                value={totalSessionDuration} 
                onChange={ (e) => setTotalSessionDuration(e.target.value)} 
                required
              />
              <InputGroup.Text>min</InputGroup.Text>
            </InputGroup>
          </Col>
        </Row>
        <hr className='my-5'/>
         {/* Filtering and Adding Techniques */}
         <h4 className='mb-3'>Techniques</h4>
        <Row >
          <Form.Group as={Col} md="5" className='mb-2 mb-md-0'>
            <InputGroup>
              <Form.Control 
                  type="text" 
                  className="form-control" 
                  id="techSearch" 
                  value={filterTerm} 
                  onChange={e => filterTechniques(e)}
                  placeholder="Search for Technique"
                />
              <Button variant="outline-primary" onClick={resetFilter}><X size={25}/></Button>
            </InputGroup>
              

            </Form.Group>
            <Form.Group as={Col} md="6"  className='mb-2 mb-md-0'>
              <Form.Select 
                value={selectedValue ? [selectedValue] : []} 
                onChange={(e) => setSelectedValue(e.target.value)}
                max="10"
                multiple
              >
                <option key="0" value=''>* Add New Technique * </option>
                {filteredTechniques.map((tech_option, index) => (
                  <option key={index} value={tech_option}>
                    {tech_option}
                  </option>
                ))}
              </Form.Select>
              </Form.Group>
            <Form.Group as={Col} md="1" className='d-flex flex-row justify-content-end align-items-start'>
              <Button  className="btn p-1 " onClick={addTechToSession}><Plus size={25}/></Button>
            </Form.Group>
        </Row>
        <hr className='my-5'/>
        {/* Rows of Technique Details */}
       
        {sessionTechniques.length === 0 ? <p className='text-center text'>Start adding trained techniques to this session!</p> :
        sessionTechniques.map((tech, index) => (
          <Row key={index} className="mb-3 align-items-center pb-3 border-bottom">
            <Col xs={12} md={2} className="d-flex justify-content-between align-items-center mb-2 mb-md-0">
              <span className='fw-medium'>{tech.name}</span>
              <div className="d-md-none">
                <Button className="btn p-1" onClick={() => deleteTechniqueFromSession(tech)}><X size={25}/></Button>
              </div>
            </Col>
            <Col xs={12} md={5} className='mb-2 mb-md-0'>
              <InputGroup>
                <InputGroup.Text>Duration</InputGroup.Text>
                <Form.Control 
                  type="number" 
                  className="form-control"
                  name="duration"
                  value={tech.duration} 
                  onChange={(e) => updateTech(tech, e)} 
                  min="1" 
                  max="600"
                />
                <InputGroup.Text>min</InputGroup.Text>
              </InputGroup>
            </Col>
            <Col xs={12} md={4} className='mb-2 mb-md-0'>
              <InputGroup>
                <InputGroup.Text>Repetitions</InputGroup.Text>
                <Form.Control 
                  type="number" 
                  className="form-control"
                  name="reps"
                  value={tech.reps} 
                  onChange={(e) => updateTech(tech, e)} 
                  min="1" 
                  max="10000"
                />
              </InputGroup>
            </Col>
            <Col md={1} className="d-none d-md-block d-md-flex flex-md-row justify-content-md-end">
              <Button className="btn p-1" onClick={() => deleteTechniqueFromSession(tech)}><X  size={25}/></Button>
            </Col>
          </Row>
        ))}
        <hr className='my-5'/>
        <Row className='mb-3 pb-3 border-bottom'>
          <Form.Label><h4 className=''>Note</h4></Form.Label>
          <Form.Control as="textarea" rows={6}/>
        </Row>
        <Button type='submit'>Save Session</Button>
      </Form>

      <div className="mt-4">
          <h5>Session Techniques:</h5>
          {sessionTechniques.map((tech, index) => (
            <div key={index} className="mb-2">
              {tech.name}, Duration: {tech.duration || ''}, Reps: {tech.reps || ''}
            </div>
          ))}
        </div>
    </div>
  );
}

