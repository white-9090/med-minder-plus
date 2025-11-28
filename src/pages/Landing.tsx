import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Pill, Clock, Users, Shield, Smartphone, Heart } from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Clock,
      title: 'Smart Reminders',
      description: 'Never miss a dose with intelligent scheduling and voice reminders',
    },
    {
      icon: Pill,
      title: 'Medicine Management',
      description: 'Organize all your medications with visual identification and stock tracking',
    },
    {
      icon: Users,
      title: 'Caregiver Support',
      description: 'Connect with family and caregivers for better medication adherence',
    },
    {
      icon: Shield,
      title: 'Prescription Scanning',
      description: 'Upload prescriptions and automatically extract medication information',
    },
    {
      icon: Smartphone,
      title: 'Elderly Friendly',
      description: 'Large fonts, simple interface, and voice assistance for seniors',
    },
    {
      icon: Heart,
      title: 'Health Tracking',
      description: 'Monitor adherence and track your medication history over time',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Pill className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">MedMinder+</h1>
            </div>
            <div className="flex space-x-4">
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button onClick={() => navigate('/signup')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Smart Prescription &
            <span className="text-blue-600"> Medicine Reminder</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Never miss a dose again. Designed for patients with chronic illnesses, 
            elderly users, and their caregivers. Simple, reliable, and accessible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-3"
              onClick={() => navigate('/signup')}
            >
              Start Free Today
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-3"
              onClick={() => navigate('/login')}
            >
              I Have an Account
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need for Medication Management
            </h2>
            <p className="text-lg text-gray-600">
              Comprehensive features designed with accessibility and ease of use in mind
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Built for Everyone Who Needs Medication Support
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Chronic Illness Patients</h3>
              <p className="text-gray-600">
                Manage complex medication schedules with confidence and ease
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Elderly Users</h3>
              <p className="text-gray-600">
                Large fonts, voice reminders, and simplified interface for seniors
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Caregivers</h3>
              <p className="text-gray-600">
                Monitor adherence and receive alerts for better care coordination
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Take Control of Your Medication?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who trust MedMinder+ for their daily medication management
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="text-lg px-8 py-3"
            onClick={() => navigate('/signup')}
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <Pill className="h-6 w-6 text-blue-400 mr-2" />
            <span className="text-lg font-semibold">MedMinder+</span>
          </div>
          <p className="text-gray-400">
            Smart medication management for better health outcomes
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;