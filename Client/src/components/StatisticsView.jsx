import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTrainingSessions } from '../store/slices/trainingSessionsSlice';
import { fetchTechniques } from '../store/slices/techniquesSlice';
import { fetchTags } from '../store/slices/tagsSlice';
import { Container, Row, Col, Form, Card, InputGroup } from 'react-bootstrap';
import moment from 'moment';
import SortableTable from './SortableTable';
import { GearFill, StopwatchFill, Icon123, TagsFill, ArrowRepeat, ClockFill } from 'react-bootstrap-icons';



export default function StatisticsView() {
    const dispatch = useDispatch();
    const { items: sessions } = useSelector((state) => state.trainingSessions);
    const { items: techniques } = useSelector((state) => state.techniques);
    const { items: tags } = useSelector((state) => state.tags);

    const [timeValue, setTimeValue] = useState(1);
    const [timeUnit, setTimeUnit] = useState('months');
    const [filteredSessions, setFilteredSessions] = useState([]);
    const [startDate, setStartDate] = useState(moment().subtract(1, 'months'));
    const [displayCountTechniques, setDisplayCountTechniques] = useState(5);
    const [displayCountTags, setDisplayCountTags] = useState(5);

    useEffect(() => {
        dispatch(fetchTrainingSessions());
        dispatch(fetchTechniques());
        dispatch(fetchTags());
    }, []);

    useEffect(() => {
        const newStartDate = moment().subtract(timeValue, timeUnit);
        setStartDate(newStartDate);
        const filtered = sessions.filter(session => moment(session.date).isAfter(newStartDate));
        setFilteredSessions(filtered);
    }, [timeValue, timeUnit, sessions]);

    const totalDuration = filteredSessions.reduce((sum, session) => sum + session.totalDuration, 0);

    // Technique summary for all techniques
    const techniqueSummaryAll = filteredSessions.reduce((acc, session) => {
        session.techniques.forEach(tech => {
            const existingTech = acc.find(t => t._id === tech.technique._id);
            if (existingTech) {
                existingTech.duration += tech.duration;
                existingTech.repetitions += tech.repetitions;
                existingTech.count += 1;
            } else {
                acc.push({
                    _id: tech.technique._id,
                    name: tech.technique.name,
                    duration: tech.duration,
                    repetitions: tech.repetitions,
                    count: 1
                });
            }
        });
        return acc;
    }, []);
    // Technique summary for # oftop techniques

    const techniqueSummary = displayCountTechniques === 'all' ? techniqueSummaryAll : techniqueSummaryAll.slice(0, parseInt(displayCountTechniques));

    const tagSummary = filteredSessions.reduce((acc, session) => {
        session.tags.forEach(tagObject => {
            const existingTag = acc.find(t => t._id === tagObject._id);
            if (existingTag) {
                existingTag.count += 1;
            }
            else {
                acc.push({
                    _id: tagObject._id,
                    name: tagObject.name || 'Unknown',
                    count: 1
                });
            }
        });
        return acc;
    }, []);

    const topTags = tagSummary.sort((a, b) => b.count - a.count);

    const techniqueSummaryColumns = [
        { key: 'name', label: <GearFill size={16} className='text-primary' /> },
        { key: 'count', label: <Icon123 size={16} className='text-primary' /> },
        {
            key: 'duration',
            label: <StopwatchFill size={16} className='text-primary' />,
            render: (tech) => tech.duration > 0 ? `${tech.duration} min` : ''
        },
        {
            key: 'repetitions',
            label: <ArrowRepeat size={16} className='text-primary' />,
            render: (tech) => tech.repetitions > 0 ? tech.repetitions : ''
        }
    ];

    const tagSummaryColumns = [
        { key: 'name', label: <TagsFill size={16} className='text-primary' /> },
        { key: 'count', label: <Icon123 size={16} className='text-primary' /> }
    ];

    return (
        <Container className="my-5">
            <Row className="align-items-center mb-4">
                <Col>
                    <h2 className="display-1">Statistics</h2>
                </Col>
            </Row>

            <Form className="mb-4">
                <Row>
                    <Col >
                        <Form.Group>
                            <Form.Label>Time Period</Form.Label>
                            <Form.Control
                                type="number"
                                value={timeValue}
                                onChange={(e) => setTimeValue(parseInt(e.target.value))}
                                min="1"
                            />
                        </Form.Group>
                    </Col>
                    <Col >
                        <Form.Group>
                            <Form.Label>Unit</Form.Label>
                            <Form.Select
                                value={timeUnit}
                                onChange={(e) => setTimeUnit(e.target.value)}
                            >
                                <option value="days">Days</option>
                                <option value="weeks">Weeks</option>
                                <option value="months">Months</option>
                                <option value="years">Years</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>
            </Form>
            <Row>
                <Col className="mb-4">
                    <Card>
                        <Card.Header className="p-3 bg-primary text-white">
                            <Card.Title className='p-0 m-0 d-flex justify-content-between align-items-center'>
                                Sessions <small className="text-light fw-light">({startDate.format('ddd, MM.DD.YY')} - {moment().format('ddd, MM.DD.YY')})</small>
                            </Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <p className="d-flex align-items-center"><Icon123 size={20} className="text-primary me-4" /><span className="display-6 ">{filteredSessions.length}</span></p>
                            <p className="d-flex align-items-center"><ClockFill size={20} className="text-primary me-4" /><span className="display-6">{totalDuration} min</span></p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row>
                <Col className="mb-4">
                    <Card>
                        <Card.Header className="p-3 bg-primary text-white">
                            <Card.Title className='p-0 m-0 d-flex justify-content-between align-items-center'>

                                Technique



                                <Form.Select
                                    value={displayCountTechniques}
                                    onChange={(e) => { console.log(e.target.value); setDisplayCountTechniques(e.target.value) }}
                                    size="sm"
                                    className="py-0 "
                                    style={{ width: '60px' }}
                                >
                                    <option value="all">All</option>
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                </Form.Select>

                            </Card.Title>
                        </Card.Header>
                        <Card.Body className='p-0 pb-1'>
                            <SortableTable
                                items={techniqueSummary}
                                columns={techniqueSummaryColumns}
                            />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Card>
                        <Card.Header className="p-3 bg-primary text-white">
                            <Card.Title className='p-0 m-0 d-flex justify-content-between align-items-center'>

                                Tags

                                <Form.Select
                                    value={displayCountTags}
                                    onChange={(e) => { console.log(e.target.value); setDisplayCountTags(e.target.value) }}
                                    size="sm"
                                    className="py-0 "
                                    style={{ width: '60px' }}
                                >
                                    <option value="all">All</option>
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                </Form.Select>

                            </Card.Title>
                        </Card.Header>
                        <Card.Body className='p-0 pb-1'>
                            <SortableTable
                                items={tagSummary}
                                columns={tagSummaryColumns}
                            />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
