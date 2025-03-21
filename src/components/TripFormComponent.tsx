import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Form, Input, Button, Card, Typography, Steps, 
  Row, Col, Divider, notification, Spin, Radio,
  Layout
} from 'antd';
import { 
  EnvironmentOutlined, LoadingOutlined, 
  ArrowRightOutlined, CarOutlined, TruckOutlined,
  ShopOutlined, ClockCircleOutlined 
} from '@ant-design/icons';
import axios from 'axios';
import '../App.css';

const { Title, Text } = Typography;
const { Step } = Steps;
const { Footer } = Layout;

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
  const [transportType, setTransportType] = useState('truck');
 
  const [currentSearch, setCurrentSearch] = useState('');
  const [pickupSearch, setPickupSearch] = useState('');
  const [dropoffSearch, setDropoffSearch] = useState('');
 
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [activeField, setActiveField] = useState<'current' | 'pickup' | 'dropoff' | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
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
    
    // Auto-advance to next step if this is the active focus
    if (activeField === 'current' && currentStep === 0) {
      setTimeout(() => setCurrentStep(1), 500);
    } else if (activeField === 'pickup' && currentStep === 1) {
      setTimeout(() => setCurrentStep(2), 500);
    }
  };

  const handleSubmit = () => {
    if (!currentLocation.lat || !currentLocation.lng ||
        !pickupLocation.lat || !pickupLocation.lng ||
        !dropoffLocation.lat || !dropoffLocation.lng) {
      
      notification.error({
        message: 'Location Error',
        description: 'Please select locations from the suggestions to ensure we have coordinates',
        placement: 'topRight'
      });
      return;
    }
   
    notification.success({
      message: 'Route Planning',
      description: 'Calculating your optimal route...',
      placement: 'topRight'
    });
    
    navigate('/results', {
      state: {
        currentLocation: currentLocation.address,
        pickupLocation: pickupLocation.address,
        dropoffLocation: dropoffLocation.address,
        currentCycle: currentCycleUsed,
        transportType: transportType,
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

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="step-container">
            <div className="step-content">
              <Title level={4}>Where are you now?</Title>
              <Text type="secondary">We'll use this to calculate your starting point</Text>
              
              <Row gutter={16} className="location-input-row">
                <Col xs={24} md={18}>
                  <Form.Item
                    label="Current Location"
                    name="currentLocation"
                    rules={[{ required: true, message: 'Please enter current location' }]}
                  >
                    <Input
                      className="location-input"
                      value={currentLocation.address}
                      onChange={(e) => handleSearchChange(e.target.value, 'current')}
                      placeholder="Search for your current location"
                      prefix={<EnvironmentOutlined className="location-icon" />}
                      suffix={isSearching && activeField === 'current' ? <LoadingOutlined /> : null}
                      autoComplete="off"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} md={3}>
                  <Form.Item
                    label="Latitude"
                    name="currentLat"
                  >
                    <Input readOnly className="coord-input" />
                  </Form.Item>
                </Col>
                <Col xs={12} md={3}>
                  <Form.Item
                    label="Longitude"
                    name="currentLng"
                  >
                    <Input readOnly className="coord-input" />
                  </Form.Item>
                </Col>
              </Row>
              
              {activeField === 'current' && suggestions.length > 0 && (
                <Card className="suggestions-card">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="suggestion-item"
                      onClick={() => handleSuggestionSelect(suggestion)}
                    >
                      <div className="suggestion-name">{suggestion.name}</div>
                      <div className="suggestion-coords">
                        {suggestion.lat.toFixed(6)}, {suggestion.lng.toFixed(6)}
                      </div>
                    </div>
                  ))}
                </Card>
              )}
            </div>
            
            <div className="step-actions">
              <Button 
                type="primary" 
                size="large"
                onClick={nextStep}
                disabled={!currentLocation.lat || !currentLocation.lng}
                className="next-button"
              >
                Next <ArrowRightOutlined />
              </Button>
            </div>
          </div>
        );
      
      case 1:
        return (
          <div className="step-container">
            <div className="step-content">
              <Title level={4}>Where will you pick up your load?</Title>
              <Text type="secondary">Enter the location where you'll be picking up</Text>
              
              <Row gutter={16} className="location-input-row">
                <Col xs={24} md={18}>
                  <Form.Item
                    label="Pickup Location"
                    name="pickupLocation"
                    rules={[{ required: true, message: 'Please enter pickup location' }]}
                  >
                    <Input
                      className="location-input"
                      value={pickupLocation.address}
                      onChange={(e) => handleSearchChange(e.target.value, 'pickup')}
                      placeholder="Search for pickup location"
                      prefix={<EnvironmentOutlined className="location-icon" />}
                      suffix={isSearching && activeField === 'pickup' ? <LoadingOutlined /> : null}
                      autoComplete="off"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} md={3}>
                  <Form.Item
                    label="Latitude"
                    name="pickupLat"
                  >
                    <Input readOnly className="coord-input" />
                  </Form.Item>
                </Col>
                <Col xs={12} md={3}>
                  <Form.Item
                    label="Longitude"
                    name="pickupLng"
                  >
                    <Input readOnly className="coord-input" />
                  </Form.Item>
                </Col>
              </Row>
              
              {activeField === 'pickup' && suggestions.length > 0 && (
                <Card className="suggestions-card">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="suggestion-item"
                      onClick={() => handleSuggestionSelect(suggestion)}
                    >
                      <div className="suggestion-name">{suggestion.name}</div>
                      <div className="suggestion-coords">
                        {suggestion.lat.toFixed(6)}, {suggestion.lng.toFixed(6)}
                      </div>
                    </div>
                  ))}
                </Card>
              )}
            </div>
            
            <div className="step-actions">
              <Button onClick={prevStep} size="large" className="prev-button">
                Back
              </Button>
              <Button 
                type="primary" 
                onClick={nextStep}
                disabled={!pickupLocation.lat || !pickupLocation.lng}
                size="large"
                className="next-button"
              >
                Next <ArrowRightOutlined />
              </Button>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="step-container">
            <div className="step-content">
              <Title level={4}>Where is your final destination?</Title>
              <Text type="secondary">Enter the location where you'll be dropping off</Text>
              
              <Row gutter={16} className="location-input-row">
                <Col xs={24} md={18}>
                  <Form.Item
                    label="Dropoff Location"
                    name="dropoffLocation"
                    rules={[{ required: true, message: 'Please enter dropoff location' }]}
                  >
                    <Input
                      className="location-input"
                      value={dropoffLocation.address}
                      onChange={(e) => handleSearchChange(e.target.value, 'dropoff')}
                      placeholder="Search for dropoff location"
                      prefix={<EnvironmentOutlined className="location-icon" />}
                      suffix={isSearching && activeField === 'dropoff' ? <LoadingOutlined /> : null}
                      autoComplete="off"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} md={3}>
                  <Form.Item
                    label="Latitude"
                    name="dropoffLat"
                  >
                    <Input readOnly className="coord-input" />
                  </Form.Item>
                </Col>
                <Col xs={12} md={3}>
                  <Form.Item
                    label="Longitude"
                    name="dropoffLng"
                  >
                    <Input readOnly className="coord-input" />
                  </Form.Item>
                </Col>
              </Row>
              
              {activeField === 'dropoff' && suggestions.length > 0 && (
                <Card className="suggestions-card">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="suggestion-item"
                      onClick={() => handleSuggestionSelect(suggestion)}
                    >
                      <div className="suggestion-name">{suggestion.name}</div>
                      <div className="suggestion-coords">
                        {suggestion.lat.toFixed(6)}, {suggestion.lng.toFixed(6)}
                      </div>
                    </div>
                  ))}
                </Card>
              )}
            </div>
            
            <div className="step-actions">
              <Button onClick={prevStep} size="large" className="prev-button">
                Back
              </Button>
              <Button 
                type="primary" 
                onClick={nextStep}
                disabled={!dropoffLocation.lat || !dropoffLocation.lng}
                size="large"
                className="next-button"
              >
                Next <ArrowRightOutlined />
              </Button>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="step-container">
            <div className="step-content">
              <Title level={4}>Trip Details</Title>
              <Text type="secondary">Enter your current cycle hours and vehicle type</Text>
              
              <Form.Item
                label="Current Cycle Hours Used"
                name="cycleHours"
                rules={[{ required: true, message: 'Please enter cycle hours' }]}
              >
                <Input
                  type="number"
                  value={currentCycleUsed}
                  onChange={(e) => setCurrentCycleUsed(e.target.value)}
                  prefix={<ClockCircleOutlined />}
                  placeholder="Enter hours used in current cycle"
                  className="hours-input"
                  size="large"
                />
              </Form.Item>
              
              <Form.Item
                label="Transport Type"
                name="transportType"
              >
                <Radio.Group 
                  value={transportType} 
                  onChange={(e) => setTransportType(e.target.value)}
                  className="transport-options"
                >
                  <Radio.Button value="truck" className="transport-option">
                    <TruckOutlined className="transport-option-icon" /> 
                    <span>Truck</span>
                  </Radio.Button>
                  <Radio.Button value="van" className="transport-option">
                    <CarOutlined className="transport-option-icon" />
                    <span>Van</span>
                  </Radio.Button>
                  <Radio.Button value="trailer" className="transport-option">
                    <ShopOutlined className="transport-option-icon" />
                    <span>Trailer</span>
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>
              
              <Divider />
              
              <div className="summary-section">
                <Title level={5}>Trip Summary</Title>
                <div className="summary-item">
                  <Text strong>Current Location:</Text>
                  <Text>{currentLocation.address}</Text>
                </div>
                <div className="summary-item">
                  <Text strong>Pickup Location:</Text>
                  <Text>{pickupLocation.address}</Text>
                </div>
                <div className="summary-item">
                  <Text strong>Dropoff Location:</Text>
                  <Text>{dropoffLocation.address}</Text>
                </div>
              </div>
            </div>
            
            <div className="step-actions">
              <Button onClick={prevStep} size="large" className="prev-button">
                Back
              </Button>
              <Button 
                type="primary" 
                onClick={handleSubmit}
                disabled={!currentCycleUsed}
                size="large"
                className="submit-button"
              >
                Calculate Route
              </Button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="trip-planner-container">
      <Row justify="center" className="header-row">
        <Col>
          <Title level={2} className="page-title">ELD Route Planner</Title>
        </Col>
      </Row>
      
      <div className="content-wrapper">
        <div className="form-column">
          <Card className="trip-form-card">
            <Steps current={currentStep} className="form-steps">
              <Step title="Current Location" />
              <Step title="Pickup Location" />
              <Step title="Dropoff Location" />
              <Step title="Trip Details" />
            </Steps>
            
            <Form form={form} layout="vertical" className="trip-form">
              {renderStep()}
            </Form>
          </Card>
        </div>
        
        <div className="map-column">
          <div
            className="map-placeholder"
            style={{
              textAlign: 'center',
              padding: '20px',
              backgroundColor: '#f0f9ff',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            <img
              src="https://via.placeholder.com/400x200?text=Plan+Your+Trip"
              alt="Plan Your Trip"
              style={{
                maxWidth: '100%',
                borderRadius: '8px',
                marginBottom: '16px',
              }}
            />
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1677ff' }}>
              Plan Your Trip with Ease
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
              Enter your locations to calculate the best route for your journey.
            </div>
          </div>
        </div>
      </div>
      
      <Footer className="app-footer">
        ELD Route Planner © {new Date().getFullYear()} | All Rights Reserved
      </Footer>
    </div>
  );
};

export default TripFormComponent;