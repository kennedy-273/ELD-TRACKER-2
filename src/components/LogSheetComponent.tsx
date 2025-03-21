import React, { useState, useEffect } from 'react';
import { Card, Typography, Table, Divider, Row, Col, Input, Form } from 'antd';

const { Title, Text } = Typography;

interface LogSheetProps {
  tripDetails: {
    currentLocation: string;
    pickupLocation: string;
    dropoffLocation: string;
    currentCycle: string;
    currentCoordinates?: { lat: number; lng: number };
    pickupCoordinates?: { lat: number; lng: number };
    dropoffCoordinates?: { lat: number; lng: number };
  };
}

const LogSheetComponent: React.FC<LogSheetProps> = ({ tripDetails }) => {
  const {
    currentLocation,
    pickupLocation,
    dropoffLocation,
    currentCycle,
    currentCoordinates,
    pickupCoordinates,
    dropoffCoordinates
  } = tripDetails;

  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString());

  // Format for displaying coordinates
  const formatCoordinates = (coords?: { lat: number; lng: number }) => {
    if (!coords) return "N/A";
    return `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
  };

  return (
    <Card className="log-sheet-card" title={<Title level={3}>ELD Logs</Title>} style={{ marginTop: '20px' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card type="inner" title="Trip Information">
            <Row gutter={[16, 8]}>
              <Col xs={24} sm={12}>
                <Form layout="vertical">
                  <Form.Item label="Current Location">
                    <Input value={currentLocation} readOnly />
                  </Form.Item>
                  <Form.Item label="Current Coordinates">
                    <Input value={formatCoordinates(currentCoordinates)} readOnly />
                  </Form.Item>
                </Form>
              </Col>
              <Col xs={24} sm={12}>
                <Form layout="vertical">
                  <Form.Item label="Cycle Hours Used">
                    <Input value={currentCycle} readOnly />
                  </Form.Item>
                </Form>
              </Col>
            </Row>
            <Divider orientation="left">Route Details</Divider>
            <Row gutter={[16, 8]}>
              <Col xs={24} sm={12}>
                <Form layout="vertical">
                  <Form.Item label="Pickup Location">
                    <Input value={pickupLocation} readOnly />
                  </Form.Item>
                  <Form.Item label="Pickup Coordinates">
                    <Input value={formatCoordinates(pickupCoordinates)} readOnly />
                  </Form.Item>
                </Form>
              </Col>
              <Col xs={24} sm={12}>
                <Form layout="vertical">
                  <Form.Item label="Dropoff Location">
                    <Input value={dropoffLocation} readOnly />
                  </Form.Item>
                  <Form.Item label="Dropoff Coordinates">
                    <Input value={formatCoordinates(dropoffCoordinates)} readOnly />
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          </Card>
        </Col>
       
        <Col span={24}>
          <Card type="inner" title="Driver's Daily Log">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Form layout="vertical">
                  <Form.Item label="Date">
                    <Input value={currentDate} readOnly />
                  </Form.Item>
                </Form>
              </Col>
              <Col xs={24} md={8}>
                <Form layout="vertical">
                  <Form.Item label="Driver">
                    <Input defaultValue="John Smith" readOnly />
                  </Form.Item>
                </Form>
              </Col>
              <Col xs={24} md={8}>
                <Form layout="vertical">
                  <Form.Item label="Truck #">
                    <Input defaultValue="TR-1234" readOnly />
                  </Form.Item>
                </Form>
              </Col>
            </Row>
           
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Table
                  dataSource={[
                    {
                      key: '1',
                      time: '00:00 - 06:00',
                      status: 'Off Duty',
                      location: ''
                    },
                    {
                      key: '2',
                      time: '06:00 - 07:00',
                      status: 'On Duty (Not Driving)',
                      location: currentLocation
                    },
                    {
                      key: '3',
                      time: '07:00 - 11:00',
                      status: 'Driving',
                      location: `${currentLocation} → ${pickupLocation}`
                    }
                  ]}
                  columns={[
                    {
                      title: 'Time',
                      dataIndex: 'time',
                      key: 'time',
                      width: 150
                    },
                    {
                      title: 'Status',
                      dataIndex: 'status',
                      key: 'status',
                      width: 200
                    },
                    {
                      title: 'Location',
                      dataIndex: 'location',
                      key: 'location'
                    }
                  ]}
                  pagination={false}
                  size="small"
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default LogSheetComponent;