import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Typography,  Form, Input, Row, Col, Space } from 'antd';
import { 
  TruckOutlined, EnvironmentOutlined, CalendarOutlined, ClockCircleOutlined, 
  ArrowRightOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;

const HomePage = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [form] = Form.useForm();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  const handleFormSubmit = (values) => {
    navigate('/trip-form', { state: values });
    setIsModalOpen(false);
  };

  return (
    <div style={{ fontFamily: "'Roboto', sans-serif", color: '#333', overflowX: 'hidden' }}>
      {/* Navigation */}
      <nav style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '70px',
          maxWidth: '1400px',
          margin: '0 auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <TruckOutlined style={{ fontSize: 32, color: '#1677ff' }} />
            <Title level={3} style={{ margin: '0 0 0 12px', color: '#1677ff', fontWeight: 700 }}>TruckLogger</Title>
          </div>
          {!isMobile && (
            <Space size={24}>
              <a href="#features" style={{ color: '#555', textDecoration: 'none', fontWeight: 500, fontSize: 16 }}>Features</a>
              <a href="#how-it-works" style={{ color: '#555', textDecoration: 'none', fontWeight: 500, fontSize: 16 }}>How It Works</a>
              <a href="#support" style={{ color: '#555', textDecoration: 'none', fontWeight: 500, fontSize: 16 }}>Support</a>
              <Button type="primary" size="large" onClick={() => navigate('/saved-trips')} style={{ borderRadius: 6 }}>Saved Trips</Button>
            </Space>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        backgroundImage: 'url(https://images.unsplash.com/photo-1501700493788-fa5651438e40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay',
        backgroundColor: 'rgba(22, 119, 255, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        position: 'relative',
      }}>
        <div style={{
          maxWidth: '1400px',
          textAlign: 'center',
          zIndex: 1,
          animation: 'fadeInUp 1s ease-out',
        }}>
          <Title style={{ fontSize: isMobile ? 40 : 64, color: '#fff', fontWeight: 800, marginBottom: 20, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            Professional ELD Logs<br />For Every Journey
          </Title>
          <Text style={{ fontSize: isMobile ? 18 : 22, color: 'rgba(255,255,255,0.9)', maxWidth: 700, display: 'block', margin: '0 auto 40px', lineHeight: 1.5 }}>
            Streamline your trucking operations with compliant routes, accurate ELD logs, and optimized driving hours—all in one powerful platform.
          </Text>
          <Space size={20}>
          <Button
            type="primary"
            size="large"
            onClick={() => navigate('/trip-form')}
            style={{ padding: '0 32px' }}
          >
            Plan Your Trip
          </Button>
            <Button
              size="large"
              onClick={() => navigate('/saved-trips')}
              style={{ padding: '0 40px', height: 50, fontSize: 18, background: '#fff', color: '#1677ff', borderRadius: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
            >
              Saved Trips
            </Button>
          </Space>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '100px 24px', backgroundColor: '#f5f7fa' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <Title level={2} style={{ textAlign: 'center', fontSize: 40, marginBottom: 16, color: '#1f2a44' }}>Your All-in-One Compliance Solution</Title>
          <Text style={{ textAlign: 'center', display: 'block', maxWidth: 600, margin: '0 auto 60px', color: '#666', fontSize: 18 }}>
            Simplify Hours of Service compliance with cutting-edge tools designed for truckers.
          </Text>
          <Row gutter={[32, 32]} justify="center">
            {[
              { icon: <EnvironmentOutlined />, title: 'Smart Route Planning', desc: 'Optimize routes with automatic rest stops tailored to HOS regulations.' },
              { icon: <CalendarOutlined />, title: 'Automated ELD Logs', desc: 'Generate DOT-compliant log sheets effortlessly for every trip.' },
              { icon: <ClockCircleOutlined />, title: 'HOS Mastery', desc: 'Stay within your 70hr/8day limits with our advanced tracking system.' },
            ].map((feature, index) => (
              <Col xs={24} sm={12} md={8} key={index}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 12,
                    boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
                    padding: 24,
                    animation: `fadeInUp 0.5s ease-out ${index * 0.2}s`,
                    animationFillMode: 'both',
                    border: 'none',
                    background: '#fff',
                  }}
                >
                  <Space direction="vertical" size={20} style={{ textAlign: 'center', width: '100%' }}>
                    <div style={{ fontSize: 40, color: '#1677ff', background: '#e6f0ff', borderRadius: '50%', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                      {feature.icon}
                    </div>
                    <Title level={4} style={{ margin: 0, color: '#1f2a44' }}>{feature.title}</Title>
                    <Text style={{ color: '#666', fontSize: 16 }}>{feature.desc}</Text>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{
        padding: '100px 24px',
        backgroundImage: 'url(https://images.unsplash.com/photo-1532375810220-7a63d29988fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(31, 42, 68, 0.85)', zIndex: 1 }} />
        <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <Title level={2} style={{ textAlign: 'center', fontSize: 40, marginBottom: 16, color: '#fff' }}>How It Works</Title>
          <Text style={{ textAlign: 'center', display: 'block', maxWidth: 600, margin: '0 auto 60px', color: 'rgba(255,255,255,0.9)', fontSize: 18 }}>
            Three simple steps to compliant routes and ELD logs.
          </Text>
          <Row gutter={[32, 32]} justify="center">
            {[
              { step: 1, title: 'Enter Trip Details', desc: 'Input your starting point, destinations, and current cycle hours.' },
              { step: 2, title: 'Review Your Route', desc: 'Get optimized routes with rest and fuel stops calculated for HOS compliance.' },
              { step: 3, title: 'Get Your ELD Logs', desc: 'Download pre-filled logs ready for inspection in seconds.' },
            ].map((item, index) => (
              <Col xs={24} md={8} key={index}>
                <div style={{ textAlign: 'center', animation: `fadeInUp 0.5s ease-out ${index * 0.2}s`, animationFillMode: 'both' }}>
                  <div style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: '#1677ff',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    fontSize: 24,
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  }}>
                    {item.step}
                  </div>
                  <Title level={4} style={{ marginBottom: 12, color: '#fff' }}>{item.title}</Title>
                  <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>{item.desc}</Text>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '100px 24px', backgroundColor: '#fff' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <Title level={2} style={{ textAlign: 'center', fontSize: 40, marginBottom: 60, color: '#1f2a44' }}>What Drivers Are Saying</Title>
          <Row gutter={[32, 32]} justify="center">
            {[
              { quote: 'TruckLogger has cut my paperwork time in half. The ELD logs are spot-on and DOT-ready every time.', name: 'Mike Johnson', title: 'Long-haul Truck Driver' },
              { quote: 'Route planning with built-in rest stops keeps me compliant and efficient. It’s a game-changer for fleet management.', name: 'Sarah Williams', title: 'Fleet Manager' },
            ].map((testimonial, index) => (
              <Col xs={24} md={12} key={index}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 12,
                    boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
                    padding: 24,
                    animation: `fadeInUp 0.5s ease-out ${index * 0.2}s`,
                    animationFillMode: 'both',
                    border: 'none',
                  }}
                >
                  <Text style={{ fontStyle: 'italic', color: '#666', display: 'block', marginBottom: 20, fontSize: 16 }}>{testimonial.quote}</Text>
                  <Space>
                    <div style={{ width: 50, height: 50, borderRadius: '50%', backgroundColor: '#1677ff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <Text strong style={{ fontSize: 16, color: '#1f2a44' }}>{testimonial.name}</Text>
                      <Text style={{ display: 'block', color: '#666', fontSize: 14 }}>{testimonial.title}</Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1506525435897-15123c3e1f2a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay',
        backgroundColor: 'rgba(22, 119, 255, 0.8)',
        padding: '100px 24px',
        textAlign: 'center',
        color: '#fff',
        position: 'relative',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <Title level={2} style={{ fontSize: 40, color: '#fff', marginBottom: 20, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            Ready to Transform Your HOS Compliance?
          </Title>
          <Text style={{ fontSize: 18, color: 'rgba(255,255,255,0.9)', maxWidth: 600, display: 'block', margin: '0 auto 40px' }}>
            Join thousands of drivers and fleets trusting TruckLogger for seamless operations.
          </Text>
          <Button
            size="large"
            onClick={() => setIsModalOpen(true)}
            style={{ padding: '0 40px', height: 50, fontSize: 18, background: '#fff', color: '#1677ff', borderRadius: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#1f2a44', color: '#fff', padding: '80px 24px 40px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <Row gutter={[32, 32]}>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'API'] },
              { title: 'Support', links: ['Documentation', 'Help Center', 'Contact Us'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Compliance'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers'] },
            ].map((column, index) => (
              <Col xs={12} sm={6} key={index}>
                <Text strong style={{ color: '#fff', textTransform: 'uppercase', letterSpacing: 1.5, display: 'block', marginBottom: 20, fontSize: 14 }}>{column.title}</Text>
                <Space direction="vertical" size={12}>
                  {column.links.map((link, i) => (
                    <a key={i} href="#" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: 14 }}>{link}</a>
                  ))}
                </Space>
              </Col>
            ))}
          </Row>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: 60, paddingTop: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <TruckOutlined style={{ fontSize: 28 }} />
              <Text strong style={{ color: '#fff', fontSize: 18 }}>TruckLogger</Text>
            </Space>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>© 2025 TruckLogger. All rights reserved.</Text>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        body {
          margin: 0;
          padding: 0;
        }
      `}</style>
    </div>
  );
};

export default HomePage;