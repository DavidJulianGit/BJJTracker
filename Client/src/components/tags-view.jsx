import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, ListGroup, InputGroup } from 'react-bootstrap';

import { X, Pencil } from 'react-bootstrap-icons'; 

export default function TagsView() {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [editingTag, setEditingTag] = useState(null);
  const [filter, setFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' for ascending, 'desc' for descending
 

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    const token = localStorage.getItem('token');
    console.log('Token:', token);

    try {
      const response = await fetch('http://localhost:5000/api/tags', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Tags fetched:', data);
        setTags(data);
      } else {
        const errorData = await response.json();
        console.error('Error fetching tags:', response.status, response.statusText, errorData);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTag.trim()) return;

    try {
      const response = await fetch('http://localhost:5000/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: newTag })
      });

      if (response.ok) {
        const data = await response.json();
        setTags([...tags, data]);
        setNewTag('');
      } else {
        const errorData = await response.json();
        console.error('Error adding tag:', response.status, response.statusText, errorData);
      }
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  const handleEdit = (tag) => {
    setEditingTag({ ...tag });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingTag.name.trim()) return;

    try {
      const response = await fetch(`http://localhost:5000/api/tags/${editingTag._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: editingTag.name })
      });

      const data = await response.json();

      if (response.ok) {
        setTags(tags.map(tag => tag._id === data._id ? data : tag));
        setEditingTag(null);
      } else {
        console.error('Error updating tag:', data.error, data.message);
        // You might want to show an error message to the user here
      }
    } catch (error) {
      console.error('Error updating tag:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tags/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setTags(tags.filter(tag => tag._id !== id));
        console.log('Tag deleted:', id);
      } else {
        console.error('Error deleting tag:', data.error, data.message);
        // You might want to show an error message to the user here
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
      // You might want to show an error message to the user here
    }
  };

  // Filter and sort tags
  const filteredTags = tags
    .filter(tag => tag.name.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const resetFilter = () => {
    setFilter('');
  };

  return (
    <Container className="mt-5">
      <h2>Manage Tags</h2>
      <Row>
        <Col md={6}>
          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Label>New Tag</Form.Label>
                <InputGroup>
                    <Form.Control
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Enter new tag name"
                /> 
                <Button type="outline-primary" >Add Tag</Button>
                </InputGroup>
            </Form.Group>
          </Form>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col md={6}>
            <Form.Group >
                <Form.Label className="me-2">Filter Tags</Form.Label>
                <InputGroup>
                    <Form.Control
                        type="text"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        placeholder="Filter by tag name"
                    />
                    <Button variant="outline-primary" onClick={resetFilter}>
                        <X size={20} />
                    </Button>
                </InputGroup>
          </Form.Group>
        </Col>
        <Col md={6} className='d-flex align-items-end'>
          <Button onClick={toggleSortOrder} className="ms-md-1 mt-2">
            Sort {sortOrder === 'asc' ? 'Descending' : 'Ascending'}
          </Button>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <ListGroup>
            {filteredTags.map(tag => (
              <ListGroup.Item key={tag._id} className="d-flex justify-content-between align-items-center">
                {editingTag && editingTag._id === tag._id ? (
                  <Form onSubmit={handleUpdate} className="w-100 d-flex">
                    <Form.Control
                      type="text"
                      value={editingTag.name}
                      onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                    />
                    <Button type="submit" size="sm" className="ms-2">Save</Button>
                    <Button variant="secondary" size="sm" className="ms-2" onClick={() => setEditingTag(null)}>Cancel</Button>
                  </Form>
                ) : (
                  <>
                    <span>{tag.name}</span>
                    <div>
                      <Button variant="outline-primary" size="sm" onClick={() => handleEdit(tag)}><Pencil /></Button>
                      <Button variant="outline-danger" size="sm" className="ms-2" onClick={() => handleDelete(tag._id)}><X size={20}/></Button>
                    </div>
                  </>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
      </Row>
    </Container>
  );
}