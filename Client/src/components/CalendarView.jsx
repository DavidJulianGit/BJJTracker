import React, { useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTrainingSessions } from '../store/slices/trainingSessionsSlice';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';


// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

const CalendarView = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: trainingSessions, status } = useSelector((state) => state.trainingSessions);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTrainingSessions());
    }
  }, [status, dispatch]);

  const events = trainingSessions.map(session => {
    const [hours, minutes] = session.time.split(':').map(Number);
    const startDate = moment(session.date).set({ hours, minutes }).toDate();
    const endDate = moment(startDate).add(session.totalDuration, 'minutes').toDate();
    
    return {
      id: session._id,
      title: `${session.time} - ${moment(session.date).set({ hours, minutes }).add(session.totalDuration, 'minutes').format('HH:mm')}`,
      start: startDate,
      end: endDate,
      allDay: false,
      resource: session
    };
  });

  const handleSelectEvent = (event) => {
    navigate(`/sessions/${event.id}`);
  };

  return (
    <Container fluid className='mt-5'>
      <Row>
        <Col>
          <div style={{ height: '500px' }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              onSelectEvent={handleSelectEvent}
              views={['month', 'week', 'day']}
              defaultView='month'
            />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default CalendarView;