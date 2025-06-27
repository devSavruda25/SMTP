import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Card, 
  Button, 
  Container, 
  Row, 
  Col, 
  Alert, 
  Table, 
  Spinner,
  Badge,
  ProgressBar,
  Stack
} from 'react-bootstrap';
import { format, isToday, parseISO, isWeekend,getDay } from 'date-fns';
import { 
  FiClock, 
  FiCalendar, 
  FiUser, 
  FiCheckCircle, 
  FiAlertCircle,
  FiTrendingUp,
  FiBarChart2,
  FiAward
} from 'react-icons/fi';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { formatDate, views } from 'react-big-calendar/lib/localizers/date-fns';

const locales = {
  'en-US': require('date-fns/locale/en-US')
};
const localizer = dateFnsLocalizer({
  format,
  parse: parseISO,
  startOfWeek: date => {
    const clone = new Date(date);
    clone.setDate(date.getDate() - date.getDay());
    return clone;
  },
  getDay,
  locales,
});

// Status badge component with icons
const StatusBadge = ({ status }) => {
  switch (status) {
    case 'present': 
      return <Badge bg="success" className="d-flex align-items-center gap-1">
        <FiCheckCircle size={14} /> Present
      </Badge>;
    case 'late': 
      return <Badge bg="warning" text="dark" className="d-flex align-items-center gap-1">
        <FiAlertCircle size={14} /> Late
      </Badge>;
    case 'absent': 
      return <Badge bg="danger" className="d-flex align-items-center gap-1">
        <FiAlertCircle size={14} /> Absent
      </Badge>;
    case 'weekend': 
      return <Badge bg="secondary" className="d-flex align-items-center gap-1">
        <FiAward size={14} /> Weekend
      </Badge>;
    default: 
      return <Badge bg="light" text="dark">N/A</Badge>;
  }
};

// Attendance summary cards
const SummaryCard = ({ icon, title, value, variant, unit }) => (
  <Card className="h-100 shadow-sm border-0">
    <Card.Body className="d-flex align-items-center">
      <div className={`bg-${variant}-subtle p-3 rounded-circle me-3`}>
        {React.cloneElement(icon, { size: 24, className: `text-${variant}` })}
      </div>
      <div>
        <h6 className="mb-1 text-muted">{title}</h6>
        <h4 className="mb-0">{value} <small className="text-muted fs-6">{unit}</small></h4>
      </div>
    </Card.Body>
  </Card>
);

export default function EmpAttendance() {
  const [email] = useState('prathamesh0755@gmail.com');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  // Generate mock data for the current month
  useEffect(() => {
    const generateMockData = () => {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      
      const mockRecords = [];
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dateStr = format(date, 'yyyy-MM-dd');
        
        if (isWeekend(date)) {
          mockRecords.push({ date: dateStr, status: 'weekend', time: '' });
          continue;
        }
        
        // Randomly generate attendance status for weekdays
        const rand = Math.random();
        let status, time;
        
        if (rand < 0.8) { // 80% chance of present
          status = 'present';
          // Random time between 8:00 AM and 10:30 AM
          const hours = 8 + Math.floor(Math.random() * 3);
          const minutes = Math.floor(Math.random() * 60);
          time = format(new Date(currentYear, currentMonth, day, hours, minutes), 'hh:mm a');
          
          if (hours >= 9) status = 'late'; // Late if after 9 AM
        } else if (rand < 0.95) { // 15% chance of absent
          status = 'absent';
          time = '';
        } else { // 5% chance of weekend (for weekdays - just for demo)
          status = 'weekend';
          time = '';
        }
        
        mockRecords.push({ date: dateStr, status, time });
      }
      
      setAttendanceRecords(mockRecords);
    };
    
    generateMockData();
  }, []);

  // Calculate attendance stats
  const { presentDays, lateDays, absentDays, totalWorkingDays } = useMemo(() => {
    const workingRecords = attendanceRecords.filter(r => r.status !== 'weekend');
    const presentDays = workingRecords.filter(r => r.status === 'present').length;
    const lateDays = workingRecords.filter(r => r.status === 'late').length;
    const absentDays = workingRecords.filter(r => r.status === 'absent').length;
    
    return {
      presentDays,
      lateDays,
      absentDays,
      totalWorkingDays: workingRecords.length,
      attendancePercentage: Math.round((presentDays / workingRecords.length) * 100)
    };
  }, [attendanceRecords]);

  // Mark attendance handler
  const handleMarkAttendance = useCallback(() => {
    if (loading || !isToday(selectedDate)) return;

    setLoading(true);
    setError('');
    setMessage('');

    // Simulate API call
    setTimeout(() => {
      try {
        const todayRecord = attendanceRecords.find(r => 
          r.date === format(new Date(), 'yyyy-MM-dd')
        );
        
        if (todayRecord && todayRecord.status !== 'weekend') {
          setError('Attendance already marked for today');
          setLoading(false);
          return;
        }
        
        const newRecord = {
          date: format(new Date(), 'yyyy-MM-dd'),
          status: Math.random() > 0.2 ? 'present' : 'late',
          time: format(new Date(), 'hh:mm a')
        };
        
        setAttendanceRecords(prev => [...prev, newRecord]);
        setMessage('Attendance marked successfully!');
      } catch (err) {
        setError('Failed to mark attendance');
      } finally {
        setLoading(false);
      }
    }, 800);
  }, [loading, selectedDate, attendanceRecords]);

  // Current date/time
  const currentDate = format(new Date(), 'PPPP');
  const currentTime = format(new Date(), 'hh:mm a');

  // Calendar events for big calendar
  const calendarEvents = useMemo(() => (
    attendanceRecords.map(record => {
      const date = parseISO(record.date);
      return {
        title: record.status.toUpperCase(),
        start: date,
        end: date,
        status: record.status,
        time: record.time
      };
    })
  ), [attendanceRecords]);

  // Custom event component for calendar
  const EventComponent = ({ event }) => (
    <div className={`p-1 small ${event.status === 'present' ? 'text-success' : 
                     event.status === 'late' ? 'text-warning' : 
                     event.status === 'absent' ? 'text-danger' : 'text-secondary'}`}>
      <strong>{event.title}</strong>
      {event.time && <div className="text-muted">{event.time}</div>}
    </div>
  );

  // Custom day cell wrapper for calendar
  const DayCellWrapper = ({ children, value }) => {
    const dateStr = format(value, 'yyyy-MM-dd');
    const record = attendanceRecords.find(r => r.date === dateStr);
    
    let className = '';
    if (record) {
      if (record.status === 'present') className = 'bg-success bg-opacity-10';
      else if (record.status === 'late') className = 'bg-warning bg-opacity-10';
      else if (record.status === 'absent') className = 'bg-danger bg-opacity-10';
    }
    
    return <div className={`h-100 ${className}`}>{children}</div>;
  };

  return (
    <div className="dashboard-content" style={{ marginLeft: '270px', padding: '10px' }}>
            <Container fluid>
 
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 d-flex align-items-center gap-2">
          <FiClock className="text-primary" /> Attendance Dashboard
        </h2>
        <div className="text-end">
          <div className="text-muted small">{currentDate}</div>
          <div className="h5 mb-0">{currentTime}</div>
        </div>
      </div>
      
      {/* Summary Cards */}
      <Row className="g-3 mb-4">
        <Col md={3}>
          <SummaryCard 
            icon={<FiCheckCircle />} 
            title="Present Days" 
            value={presentDays} 
            variant="success" 
            unit="days" 
          />
        </Col>
        <Col md={3}>
          <SummaryCard 
            icon={<FiAlertCircle />} 
            title="Late Arrivals" 
            value={lateDays} 
            variant="warning" 
            unit="days" 
          />
        </Col>
        <Col md={3}>
          <SummaryCard 
            icon={<FiAlertCircle />} 
            title="Absent Days" 
            value={absentDays} 
            variant="danger" 
            unit="days" 
          />
        </Col>
        <Col md={3}>
          <SummaryCard 
            icon={<FiTrendingUp />} 
            title="Attendance Rate" 
            value={Math.round((presentDays / totalWorkingDays) * 100)} 
            variant="info" 
            unit="%" 
          />
        </Col>
      </Row>
      
      <Row className="g-4">
        {/* Monthly Overview Card - Redesigned */}
<Col lg={5}>
  <Card className="shadow-sm h-100 border-0">
    <Card.Body className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-3 px-2">
        <h5 className="mb-0 d-flex align-items-center gap-2 text-primary">
          <FiCalendar size={20} /> Monthly Overview
        </h5>
        <Badge bg="light" text="dark" className="fw-normal">
          {format(new Date(), 'MMMM yyyy')}
        </Badge>
      </div>
      
      {/* Calendar Container */}
      <div className="calendar-container rounded-3 border p-2 mb-3">
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 280 }}
          views={['month']}
          components={{
            event: EventComponent,
            dateCellWrapper: DayCellWrapper
          }}
          tooltipAccessor={null}
          onSelectEvent={event => setSelectedDate(event.start)}
          className="border-0"
        />
      </div>
      
      {/* Legend */}
      <div className="d-flex flex-wrap justify-content-center gap-3 px-2">
        {[
          { color: 'success', label: 'Present' },
          { color: 'warning', label: 'Late' },
          { color: 'danger', label: 'Absent' },
          { color: 'secondary', label: 'Weekend' }
        ].map((item, index) => (
          <div key={index} className="d-flex align-items-center gap-1">
            <span 
              className={`color-indicator bg-${item.color}`}
              style={{ width: 12, height: 12, borderRadius: '50%' }}
            ></span>
            <small className="text-muted">{item.label}</small>
          </div>
        ))}
      </div>
      
      {/* Quick Stats */}
      <div className="mt-4 p-3 bg-light rounded-3">
        <h6 className="mb-3 text-center">This Month's Summary</h6>
        <Row className="g-2 text-center">
          <Col xs={6} md={3}>
            <div className="p-2">
              <div className="text-success fw-bold">{presentDays}</div>
              <small className="text-muted">Present</small>
            </div>
          </Col>
          <Col xs={6} md={3}>
            <div className="p-2">
              <div className="text-warning fw-bold">{lateDays}</div>
              <small className="text-muted">Late</small>
            </div>
          </Col>
          <Col xs={6} md={3}>
            <div className="p-2">
              <div className="text-danger fw-bold">{absentDays}</div>
              <small className="text-muted">Absent</small>
            </div>
          </Col>
          <Col xs={6} md={3}>
            <div className="p-2">
              <div className="text-primary fw-bold">
                {Math.round((presentDays / totalWorkingDays) * 100)}%
              </div>
              <small className="text-muted">Rate</small>
            </div>
          </Col>
        </Row>
      </div>
    </Card.Body>
  </Card>
</Col>
        
        <Col lg={7}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0 d-flex align-items-center gap-2">
                  <FiBarChart2 className="text-primary" /> Daily Records
                </h5>
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={handleMarkAttendance}
                  disabled={loading || !isToday(selectedDate)}
                >
                  {loading ? (
                    <Spinner as="span" animation="border" size="sm" />
                  ) : (
                    'Mark Today\'s Attendance'
                  )}
                </Button>
              </div>
              
              {message && <Alert variant="success" className="py-2">{message}</Alert>}
              {error && <Alert variant="danger" className="py-2">{error}</Alert>}
              
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">This Month's Progress</h6>
                  <small className="text-muted">
                    {presentDays} of {totalWorkingDays} working days
                  </small>
                </div>
                <ProgressBar now={(presentDays / totalWorkingDays) * 100} 
                  variant="success" 
                  className="mb-3" 
                  style={{ height: '8px' }} 
                />
              </div>
              
              <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <Table hover className="mb-0">
                  <thead className="sticky-top bg-light">
                    <tr>
                      <th>Date</th>
                      <th>Day</th>
                      <th>Status</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((record, index) => {
                        const date = parseISO(record.date);
                        return (
                          <tr key={index} className={isToday(date) ? 'table-primary' : ''}>
                            <td>{format(date, 'dd MMM yyyy')}</td>
                            <td>{format(date, 'EEEE')}</td>
                            <td><StatusBadge status={record.status} /></td>
                            <td>{record.time || '-'}</td>
                          </tr>
                        );
                      })
                    }
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
    </div>
  );
}