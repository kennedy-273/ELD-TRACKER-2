import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Space, Row, Col } from 'antd';
import { EnvironmentOutlined, LoadingOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;

interface LocationData {
  address: string;
  lat?: number;
  lng?: number;
}

interface LocationSuggestion {
  id: string;
  name: string;
  formattedName: string;
  lat: number;
  lng: number;
}

const TripFormComponent: React.FC = () => {
  const [form] = Form.useForm();
  const [currentLocation, setCurrentLocation] = useState<LocationData>({ address: '' });
  const [pickupLocation, setPickupLocation] = useState<LocationData>({ address: '' });
  const [dropoffLocation, setDropoffLocation] = useState<LocationData>({ address: '' });
  const [currentCycleUsed, setCurrentCycleUsed] = useState('');
 
  const [currentSearch, setCurrentSearch] = useState('');
  const [pickupSearch, setPickupSearch] = useState('');
  const [dropoffSearch, setDropoffSearch] = useState('');
 
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [activeField, setActiveField] = useState<'current' | 'pickup' | 'dropoff' | null>(null);
  const [isSearching, setIsSearching] = useState(false);
 
  const navigate = useNavigate();

  const searchLocations = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`
      );
     
      if (response.data) {
        const formattedResults: LocationSuggestion[] = response.data.map((item: any) => ({
          id: item.place_id,
          name: item.display_name,
          formattedName: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        }));
       
        setSuggestions(formattedResults);
      }
    } catch (error) {
      console.error('Error searching locations:', error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (value: string, field: 'current' | 'pickup' | 'dropoff') => {
    setActiveField(field);
   
    switch (field) {
      case 'current':
        setCurrentSearch(value);
        setCurrentLocation({
          ...currentLocation,
          address: value,
          lat: undefined,
          lng: undefined
        });
        break;
      case 'pickup':
        setPickupSearch(value);
        setPickupLocation({
          ...pickupLocation,
          address: value,
          lat: undefined,
          lng: undefined
        });
        break;
      case 'dropoff':
        setDropoffSearch(value);
        setDropoffLocation({
          ...dropoffLocation,
          address: value,
          lat: undefined,
          lng: undefined
        });
        break;
    }
   
    searchLocations(value);
  };

  const handleSuggestionSelect = (suggestion: LocationSuggestion) => {
    switch (activeField) {
      case 'current':
        setCurrentLocation({
          address: suggestion.formattedName,
          lat: suggestion.lat,
          lng: suggestion.lng
        });
        setCurrentSearch('');
        form.setFieldsValue({
          currentLat: suggestion.lat.toFixed(6),
          currentLng: suggestion.lng.toFixed(6)
        });
        break;
      case 'pickup':
        setPickupLocation({
          address: suggestion.formattedName,
          lat: suggestion.lat,
          lng: suggestion.lng
        });
        setPickupSearch('');
        form.setFieldsValue({
          pickupLat: suggestion.lat.toFixed(6),
          pickupLng: suggestion.lng.toFixed(6)
        });
        break;
      case 'dropoff':
        setDropoffLocation({
          address: suggestion.formattedName,
          lat: suggestion.lat,
          lng: suggestion.lng
        });
        setDropoffSearch('');
        form.setFieldsValue({
          dropoffLat: suggestion.lat.toFixed(6),
          dropoffLng: suggestion.lng.toFixed(6)
        });
        break;
    }
   
    setSuggestions([]);
    setActiveField(null);
  };

  const handleSubmit = () => {
    if (!currentLocation.lat || !currentLocation.lng ||
        !pickupLocation.lat || !pickupLocation.lng ||
        !dropoffLocation.lat || !dropoffLocation.lng) {
      alert("Please select locations from the suggestions to ensure we have coordinates");
      return;
    }
   
    navigate('/results', {
      state: {
        currentLocation: currentLocation.address,
        pickupLocation: pickupLocation.address,
        dropoffLocation: dropoffLocation.address,
        currentCycle: currentCycleUsed,
        currentCoordinates: {
          lat: currentLocation.lat,
          lng: currentLocation.lng
        },
        pickupCoordinates: {
          lat: pickupLocation.lat,
          lng: pickupLocation.lng
        },
        dropoffCoordinates: {
          lat: dropoffLocation.lat,
          lng: dropoffLocation.lng
        }
      }
    });
  };

  return (
    <div className="container">
      <Row justify="center" style={{ marginBottom: '20px' }}>
        <Col>
          <Title level={2}>ELD Route Planner</Title>
        </Col>
      </Row>
     
      <Card title="Route Information">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col xs={24} md={18}>
              <Form.Item
                label="Current Location"
                name="currentLocation"
                rules={[{ required: true, message: 'Please enter current location' }]}
              >
                <Input
                  value={currentLocation.address}
                  onChange={(e) => handleSearchChange(e.target.value, 'current')}
                  placeholder="Enter current location"
                  prefix={<EnvironmentOutlined />}
                  suffix={isSearching && activeField === 'current' ? <LoadingOutlined /> : null}
                  autoComplete="off"
                />
              </Form.Item>
            </Col>
            <Col xs={12} md={3}>
              <Form.Item
                label="Latitude"
                name="currentLat"
              >
                <Input readOnly />
              </Form.Item>
            </Col>
            <Col xs={12} md={3}>
              <Form.Item
                label="Longitude"
                name="currentLng"
              >
                <Input readOnly />
              </Form.Item>
            </Col>
          </Row>
         
          {activeField === 'current' && suggestions.length > 0 && (
            <Card size="small" style={{ marginTop: -16, marginBottom: 16 }}>
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  style={{
                    padding: '8px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f0f0f0'
                  }}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div>{suggestion.name}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    {suggestion.lat.toFixed(6)}, {suggestion.lng.toFixed(6)}
                  </div>
                </div>
              ))}
            </Card>
          )}
         
          <Row gutter={16}>
            <Col xs={24} md={18}>
              <Form.Item
                label="Pickup Location"
                name="pickupLocation"
                rules={[{ required: true, message: 'Please enter pickup location' }]}
              >
                <Input
                  value={pickupLocation.address}
                  onChange={(e) => handleSearchChange(e.target.value, 'pickup')}
                  placeholder="Enter pickup location"
                  prefix={<EnvironmentOutlined />}
                  suffix={isSearching && activeField === 'pickup' ? <LoadingOutlined /> : null}
                  autoComplete="off"
                />
              </Form.Item>
            </Col>
            <Col xs={12} md={3}>
              <Form.Item
                label="Latitude"
                name="pickupLat"
              >
                <Input readOnly />
              </Form.Item>
            </Col>
            <Col xs={12} md={3}>
              <Form.Item
                label="Longitude"
                name="pickupLng"
              >
                <Input readOnly />
              </Form.Item>
            </Col>
          </Row>
         
          {activeField === 'pickup' && suggestions.length > 0 && (
            <Card size="small" style={{ marginTop: -16, marginBottom: 16 }}>
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  style={{
                    padding: '8px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f0f0f0'
                  }}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div>{suggestion.name}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    {suggestion.lat.toFixed(6)}, {suggestion.lng.toFixed(6)}
                  </div>
                </div>
              ))}
            </Card>
          )}
         
          <Row gutter={16}>
            <Col xs={24} md={18}>
              <Form.Item
                label="Dropoff Location"
                name="dropoffLocation"
                rules={[{ required: true, message: 'Please enter dropoff location' }]}
              >
                <Input
                  value={dropoffLocation.address}
                  onChange={(e) => handleSearchChange(e.target.value, 'dropoff')}
                  placeholder="Enter dropoff location"
                  prefix={<EnvironmentOutlined />}
                  suffix={isSearching && activeField === 'dropoff' ? <LoadingOutlined /> : null}
                  autoComplete="off"
                />
              </Form.Item>
            </Col>
            <Col xs={12} md={3}>
              <Form.Item
                label="Latitude"
                name="dropoffLat"
              >
                <Input readOnly />
              </Form.Item>
            </Col>
            <Col xs={12} md={3}>
              <Form.Item
                label="Longitude"
                name="dropoffLng"
              >
                <Input readOnly />
              </Form.Item>
            </Col>
          </Row>
         
          {activeField === 'dropoff' && suggestions.length > 0 && (
            <Card size="small" style={{ marginTop: -16, marginBottom: 16 }}>
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  style={{
                    padding: '8px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f0f0f0'
                  }}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div>{suggestion.name}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    {suggestion.lat.toFixed(6)}, {suggestion.lng.toFixed(6)}
                  </div>
                </div>
              ))}
            </Card>
          )}
         
          <Form.Item
            label="Current Cycle Hours Used"
            name="cycleHours"
            rules={[{ required: true, message: 'Please enter cycle hours' }]}
          >
            <Input
              type="number"
              value={currentCycleUsed}
              onChange={(e) => setCurrentCycleUsed(e.target.value)}
            />
          </Form.Item>
         
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large">
              Calculate Route
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default TripFormComponent;