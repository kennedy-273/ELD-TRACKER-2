import React, { useState, useEffect } from 'react';
import { Card, Typography, Table, Divider, Row, Col, Input, Form, Badge, Progress } from 'antd';

const { Title } = Typography;

interface LogSheetProps {
  tripDetails: {
    currentLocation: string;
    pickupLocation: string;
    dropoffLocation: string;
    currentCycle: string;
    currentCoordinates?: { lat: number; lng: number };
    pickupCoordinates?: { lat: number; lng: number };
    dropoffCoordinates?: { lat: number; lng: number };
    totalDistance: number; // Now required, no default
    drivingTime: number;   // Now required, no default
  };
}

interface LogEntry {
  key: string;
  time: string;
  status: string;
  location: string;
  duration: number;
}

const LogSheetComponent: React.FC<LogSheetProps> = ({ tripDetails }) => {
  const {
    currentLocation,
    pickupLocation,
    dropoffLocation,
    currentCycle,
    currentCoordinates,
    pickupCoordinates,
    dropoffCoordinates,
    totalDistance,
    drivingTime,
  } = tripDetails;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [totalHours, setTotalHours] = useState({
    offDuty: 0,
    sleeperBerth: 0,
    driving: 0,
    onDutyNotDriving: 0,
  });

  const formatCoordinates = (coords?: { lat: number; lng: number }) =>
    coords ? `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}` : 'N/A';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Off Duty': return '#94a3b8';
      case 'Sleeper Berth': return '#7c3aed';
      case 'Driving': return '#10b981';
      case 'On Duty (Not Driving)': return '#f97316';
      default: return '#cbd5e1';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'Off Duty': return '#f1f5f9';
      case 'Sleeper Berth': return '#f3e8ff';
      case 'Driving': return '#d1fae5';
      case 'On Duty (Not Driving)': return '#fff7ed';
      default: return '#f8fafc';
    }
  };

  useEffect(() => {
    console.log('LogSheetComponent tripDetails:', tripDetails);
    console.log('Total Distance:', totalDistance, 'Driving Time:', drivingTime);

    if (!totalDistance || !drivingTime || isNaN(totalDistance) || isNaN(drivingTime)) {
      console.error('Invalid totalDistance or drivingTime');
      return;
    }

    const entries: LogEntry[] = [];
    let currentTime = 0;
    let totalDrivingHours = 0;
    let day = 1;
    let currentDayEntries: LogEntry[] = [];

    // Day 1: Initial Off Duty
    const offDutyDuration1 = 6;
    currentDayEntries.push({
      key: `${day}-1`,
      time: '00:00 - 06:00',
      status: 'Off Duty',
      location: '',
      duration: offDutyDuration1,
    });
    currentTime = 6;

    // Pre-trip inspection
    const preTripDuration = 1;
    currentDayEntries.push({
      key: `${day}-2`,
      time: '06:00 - 07:00',
      status: 'On Duty (Not Driving)',
      location: currentLocation,
      duration: preTripDuration,
    });
    currentTime = 7;

    // Driving to Pickup (assume proportional to total distance)
    const distanceToPickup = totalDistance * 0.35; // 35% of total distance
    const driveToPickupDuration = Math.min(5, drivingTime * 0.35); // Proportional time
    currentDayEntries.push({
      key: `${day}-3`,
      time: '07:00 - 12:00',
      status: 'Driving',
      location: `${currentLocation} → ${pickupLocation}`,
      duration: driveToPickupDuration,
    });
    currentTime = 12;
    totalDrivingHours += driveToPickupDuration;

    // Pickup
    const pickupDuration = 1;
    currentDayEntries.push({
      key: `${day}-4`,
      time: '12:00 - 13:00',
      status: 'On Duty (Not Driving)',
      location: pickupLocation,
      duration: pickupDuration,
    });
    currentTime = 13;

    // Driving toward Dropoff
    let remainingDrivingHours = drivingTime - driveToPickupDuration;
    let drivingSegment = Math.min(5, remainingDrivingHours);
    const driveToDropoff1Duration = drivingSegment;
    currentDayEntries.push({
      key: `${day}-5`,
      time: '13:00 - 18:00',
      status: 'Driving',
      location: `${pickupLocation} → ${dropoffLocation}`,
      duration: driveToDropoff1Duration,
    });
    currentTime = 18;
    totalDrivingHours += driveToDropoff1Duration;
    remainingDrivingHours -= driveToDropoff1Duration;

    // Fueling stop
    const fuelingDuration = 0.5;
    currentDayEntries.push({
      key: `${day}-6`,
      time: '18:00 - 18:30',
      status: 'On Duty (Not Driving)',
      location: 'Fueling Stop',
      duration: fuelingDuration,
    });
    currentTime = 18.5;

    // Drive to reach 11-hour limit or remaining time
    const driveToDropoff2Duration = Math.min(1, remainingDrivingHours);
    currentDayEntries.push({
      key: `${day}-7`,
      time: '18:30 - 19:30',
      status: 'Driving',
      location: `${pickupLocation} → ${dropoffLocation}`,
      duration: driveToDropoff2Duration,
    });
    currentTime = 19.5;
    totalDrivingHours += driveToDropoff2Duration;
    remainingDrivingHours -= driveToDropoff2Duration;

    // Mandatory 10-hour rest
    const sleeperBerth1Duration = 4.5;
    currentDayEntries.push({
      key: `${day}-8`,
      time: '19:30 - 24:00',
      status: 'Sleeper Berth',
      location: '',
      duration: sleeperBerth1Duration,
    });
    entries.push(...currentDayEntries);

    // Day 2
    day += 1;
    currentDayEntries = [];

    // Continue rest
    const sleeperBerth2Duration = 5.5;
    currentDayEntries.push({
      key: `${day}-1`,
      time: '00:00 - 05:30',
      status: 'Sleeper Berth',
      location: '',
      duration: sleeperBerth2Duration,
    });
    currentTime = 5.5;

    // Pre-trip inspection
    const preTrip2Duration = 1;
    currentDayEntries.push({
      key: `${day}-2`,
      time: '05:30 - 06:30',
      status: 'On Duty (Not Driving)',
      location: '',
      duration: preTrip2Duration,
    });
    currentTime = 6.5;

    // Drive remaining hours
    const remainingDriveTime = Math.min(remainingDrivingHours, 3);
    const driveToDropoff3Duration = remainingDriveTime;
    currentDayEntries.push({
      key: `${day}-3`,
      time: '06:30 - 09:30',
      status: 'Driving',
      location: `${pickupLocation} → ${dropoffLocation}`,
      duration: driveToDropoff3Duration,
    });
    currentTime = 9.5;
    totalDrivingHours += remainingDriveTime;

    // Drop-off
    const dropoffDuration = 1;
    currentDayEntries.push({
      key: `${day}-4`,
      time: '09:30 - 10:30',
      status: 'On Duty (Not Driving)',
      location: dropoffLocation,
      duration: dropoffDuration,
    });
    currentTime = 10.5;

    // Off Duty for the rest of the day
    const offDutyDuration2 = 13.5;
    currentDayEntries.push({
      key: `${day}-5`,
      time: '10:30 - 24:00',
      status: 'Off Duty',
      location: '',
      duration: offDutyDuration2,
    });

    entries.push(...currentDayEntries);
    setLogEntries(entries);

    const totals = entries.reduce(
      (acc, entry) => {
        switch (entry.status) {
          case 'Off Duty': acc.offDuty += entry.duration; break;
          case 'Sleeper Berth': acc.sleeperBerth += entry.duration; break;
          case 'Driving': acc.driving += entry.duration; break;
          case 'On Duty (Not Driving)': acc.onDutyNotDriving += entry.duration; break;
        }
        return acc;
      },
      { offDuty: 0, sleeperBerth: 0, driving: 0, onDutyNotDriving: 0 }
    );

    setTotalHours(totals);
  }, [tripDetails, totalDistance, drivingTime, currentLocation, pickupLocation, dropoffLocation]);

  const StatusGrid = ({ day }: { day: number }) => {
    const dayEntries = logEntries.filter(entry => entry.key.startsWith(`${day}-`));
    return (
      <div style={{ overflowX: 'auto', marginTop: '16px' }}>
        <div style={{ position: 'relative', width: '100%', height: '130px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
          <div style={{ display: 'flex', width: '100%', height: '24px', borderBottom: '1px solid #e5e7eb' }}>
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={`hour-${i}`} style={{ position: 'relative', width: `${100 / 24}%` }}>
                {i < 24 && (
                  <span style={{ position: 'absolute', fontSize: '12px', color: '#6b7280', left: '-4px' }}>{i}</span>
                )}
                <div style={{ position: 'absolute', height: '130px', width: '1px', backgroundColor: '#e5e7eb', left: '0', top: '0' }}></div>
              </div>
            ))}
          </div>
          <div style={{ position: 'absolute', left: '-80px', top: '30px', height: '96px', display: 'flex', flexDirection: 'column', justifyContent: 'space-around', fontSize: '12px', color: '#4b5563' }}>
            <div>Off Duty</div>
            <div>Sleeper</div>
            <div>Driving</div>
            <div>On Duty</div>
          </div>
          <div style={{ position: 'relative', height: '96px', width: '100%', marginTop: '10px' }}>
            {dayEntries.map((entry, idx) => {
              const [startTime, endTime] = entry.time.split(' - ');
              const startHour = parseInt(startTime.split(':')[0]) + parseInt(startTime.split(':')[1]) / 60;
              const endHour = parseInt(endTime.split(':')[0]) + parseInt(endTime.split(':')[1]) / 60;
              const startPercent = (startHour / 24) * 100;
              const width = ((endHour - startHour) / 24) * 100;
              let topPosition;
              switch (entry.status) {
                case 'Off Duty': topPosition = '0px'; break;
                case 'Sleeper Berth': topPosition = '24px'; break;
                case 'Driving': topPosition = '48px'; break;
                case 'On Duty (Not Driving)': topPosition = '72px'; break;
                default: topPosition = '0px';
              }
              return (
                <div
                  key={`bar-${idx}`}
                  style={{
                    position: 'absolute',
                    left: `${startPercent}%`,
                    width: `${width}%`,
                    height: '24px',
                    top: topPosition,
                    backgroundColor: getStatusColor(entry.status),
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: '4px',
                    paddingRight: '4px',
                    overflow: 'hidden',
                    fontSize: '11px',
                    color: 'white',
                    fontWeight: 500,
                  }}
                >
                  {width > 7 && entry.time}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const DailySummary = ({ day }: { day: number }) => {
    const dayEntries = logEntries.filter(entry => entry.key.startsWith(`${day}-`));
    const dailyTotals = dayEntries.reduce(
      (acc, entry) => {
        switch (entry.status) {
          case 'Off Duty': acc.offDuty += entry.duration; break;
          case 'Sleeper Berth': acc.sleeperBerth += entry.duration; break;
          case 'Driving': acc.driving += entry.duration; break;
          case 'On Duty (Not Driving)': acc.onDutyNotDriving += entry.duration; break;
        }
        return acc;
      },
      { offDuty: 0, sleeperBerth: 0, driving: 0, onDutyNotDriving: 0 }
    );
    return (
      <Row gutter={16} style={{ marginTop: '16px' }}>
        <Col span={6}><div style={{ display: 'flex', alignItems: 'center' }}><div style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: getStatusColor('Off Duty'), marginRight: '8px' }}></div><span style={{ fontSize: '13px' }}>Off Duty: {dailyTotals.offDuty.toFixed(1)}h</span></div></Col>
        <Col span={6}><div style={{ display: 'flex', alignItems: 'center' }}><div style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: getStatusColor('Sleeper Berth'), marginRight: '8px' }}></div><span style={{ fontSize: '13px' }}>Sleeper: {dailyTotals.sleeperBerth.toFixed(1)}h</span></div></Col>
        <Col span={6}><div style={{ display: 'flex', alignItems: 'center' }}><div style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: getStatusColor('Driving'), marginRight: '8px' }}></div><span style={{ fontSize: '13px' }}>Driving: {dailyTotals.driving.toFixed(1)}h</span></div></Col>
        <Col span={6}><div style={{ display: 'flex', alignItems: 'center' }}><div style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: getStatusColor('On Duty (Not Driving)'), marginRight: '8px' }}></div><span style={{ fontSize: '13px' }}>On Duty: {dailyTotals.onDutyNotDriving.toFixed(1)}h</span></div></Col>
      </Row>
    );
  };

  return (
    <Card className="log-sheet-card" title={<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><Title level={3} style={{ margin: 0 }}>Electronic Logging Device Records</Title><Badge style={{ backgroundColor: '#e6f4ff', color: '#1677ff' }} count={<span style={{ padding: '0 8px' }}>Cycle: {currentCycle}</span>} /></div>} style={{ marginTop: '20px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', borderRadius: '12px' }}>
      <Card type="inner" title="Trip Information" style={{ marginBottom: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Current Location</div>
              <div style={{ display: 'flex', alignItems: 'center' }}><div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', marginRight: '8px', animation: 'pulse 2s infinite' }}></div><div style={{ fontSize: '15px', fontWeight: 500 }}>{currentLocation}</div></div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{formatCoordinates(currentCoordinates)}</div>
            </div>
            <div><div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Cycle Hours</div><div style={{ fontSize: '15px', fontWeight: 500 }}>{currentCycle}</div></div>
          </Col>
          <Col xs={24} sm={12}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div><div style={{ fontSize: '13px', color: '#6b7280' }}>Origin</div><div style={{ fontSize: '15px', fontWeight: 500 }}>{currentLocation}</div></div>
                <div style={{ textAlign: 'right' }}><div style={{ fontSize: '13px', color: '#6b7280' }}>Distance</div><div style={{ fontSize: '15px', fontWeight: 500 }}>{totalDistance} miles</div></div>
              </div>
              <Progress percent={Math.min((totalHours.driving / drivingTime) * 100, 100)} showInfo={false} strokeColor="#1677ff" trailColor="#e5e7eb" style={{ marginTop: '8px', marginBottom: '8px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div><div style={{ fontSize: '13px', color: '#6b7280' }}>Destination</div><div style={{ fontSize: '15px', fontWeight: 500 }}>{dropoffLocation}</div></div>
                <div style={{ textAlign: 'right' }}><div style={{ fontSize: '13px', color: '#6b7280' }}>Time</div><div style={{ fontSize: '15px', fontWeight: 500 }}>{drivingTime.toFixed(1)} hrs</div></div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {[1, 2].map((day) => (
        <Card key={day} type="inner" title={<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span>Driver's Daily Log - Day {day}</span><span style={{ fontSize: '14px', color: '#6b7280' }}>Distance: {day === 1 ? totalDistance : (totalDistance * (drivingTime - totalHours.driving) / drivingTime)} miles</span></div>} style={{ marginBottom: '20px', borderRadius: '8px', boxShadow: 'none', border: '1px solid #e5e7eb' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}><Form layout="vertical"><Form.Item label="Date" style={{ marginBottom: '8px' }}><Input value={`${currentDate.getMonth() + 1}/${currentDate.getDate() + (day - 1)}/${currentDate.getFullYear()}`} readOnly style={{ borderRadius: '6px' }} /></Form.Item></Form></Col>
            <Col xs={24} md={8}><Form layout="vertical"><Form.Item label="Total Miles Driving Today" style={{ marginBottom: '8px' }}><Input value={day === 1 ? totalDistance.toString() : (totalDistance * (drivingTime - totalHours.driving) / drivingTime).toString()} readOnly style={{ borderRadius: '6px' }} /></Form.Item></Form></Col>
            <Col xs={24} md={8}><Form layout="vertical"><Form.Item label="Driver" style={{ marginBottom: '8px' }}><Input defaultValue="John E. Doe" readOnly style={{ borderRadius: '6px' }} /></Form.Item></Form></Col>
          </Row>
          <StatusGrid day={day} />
          <DailySummary day={day} />
          <Table
            dataSource={logEntries.filter((entry) => entry.key.startsWith(`${day}-`))}
            columns={[
              { title: 'Time', dataIndex: 'time', key: 'time', width: 150 },
              { title: 'Status', dataIndex: 'status', key: 'status', width: 200, render: (status) => <Badge style={{ backgroundColor: getStatusBgColor(status), color: getStatusColor(status), padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }} count={status} /> },
              { title: 'Location', dataIndex: 'location', key: 'location' },
              { title: 'Duration', dataIndex: 'duration', key: 'duration', width: 100, render: (duration) => `${duration}h` },
            ]}
            pagination={false}
            size="small"
            style={{ marginTop: '20px' }}
            rowClassName={(record, index) => index % 2 === 0 ? 'even-row' : 'odd-row'}
          />
        </Card>
      ))}

      <Card type="inner" title="Trip Summary" style={{ marginBottom: '20px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}><Card bodyStyle={{ padding: '12px' }} style={{ boxShadow: 'none', borderRadius: '8px', backgroundColor: 'white' }}><div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Total Driving</div><div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>{totalHours.driving.toFixed(1)}h</div></Card></Col>
          <Col xs={12} sm={6}><Card bodyStyle={{ padding: '12px' }} style={{ boxShadow: 'none', borderRadius: '8px', backgroundColor: 'white' }}><div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Off Duty</div><div style={{ fontSize: '20px', fontWeight: 'bold', color: '#94a3b8' }}>{totalHours.offDuty.toFixed(1)}h</div></Card></Col>
          <Col xs={12} sm={6}><Card bodyStyle={{ padding: '12px' }} style={{ boxShadow: 'none', borderRadius: '8px', backgroundColor: 'white' }}><div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Sleeper Berth</div><div style={{ fontSize: '20px', fontWeight: 'bold', color: '#7c3aed' }}>{totalHours.sleeperBerth.toFixed(1)}h</div></Card></Col>
          <Col xs={12} sm={6}><Card bodyStyle={{ padding: '12px' }} style={{ boxShadow: 'none', borderRadius: '8px', backgroundColor: 'white' }}><div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>On Duty (Not Driving)</div><div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f97316' }}>{totalHours.onDutyNotDriving.toFixed(1)}h</div></Card></Col>
        </Row>
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #dbeafe', display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4b5563' }}>
          <div>Driver: John E. Doe</div>
          <div>Hours of Service Remaining: {(70 - totalHours.driving - totalHours.onDutyNotDriving).toFixed(1)}h</div>
        </div>
      </Card>

      <style jsx global>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
        .even-row { background-color: #ffffff; }
        .odd-row { background-color: #f9fafb; }
      `}</style>
    </Card>
  );
};

export default LogSheetComponent;