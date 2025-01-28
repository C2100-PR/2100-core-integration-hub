import React, { useState, useEffect } from 'react';
import {
  Card,
  Select,
  Button,
  Alert,
  Input,
  Progress
} from '@/components/ui';

interface AgentTemplate {
  id: string;
  name: string;
  baseAgent: string;
  description: string;
}

interface Customer {
  id: string;
  name: string;
  organization: string;
}

const AgentHubDashboard: React.FC = () => {
  // Step tracking
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form data
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [deploymentName, setDeploymentName] = useState('');
  
  // Data states
  const [templates, setTemplates] = useState<AgentTemplate[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  // Load templates and customers
  useEffect(() => {
    async function fetchData() {
      const [templatesData, customersData] = await Promise.all([
        fetch('/api/agent-hub/templates').then(res => res.json()),
        fetch('/api/agent-hub/customers').then(res => res.json())
      ]);
      
      setTemplates(templatesData);
      setCustomers(customersData);
    }
    
    fetchData();
  }, []);
  
  // Step 1: Template Selection
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setCurrentStep(2);
  };
  
  // Step 2: Customer Assignment
  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomer(customerId);
    setCurrentStep(3);
  };
  
  // Step 3: Deployment Confirmation
  const handleDeploy = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/agent-hub/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplate,
          customerId: selectedCustomer,
          deploymentName,
        }),
      });
      
      if (!response.ok) throw new Error('Deployment failed');
      
      Alert.success('Agent deployed successfully!');
    } catch (error) {
      Alert.error('Failed to deploy agent');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Agent Hub Dashboard</h1>
      
      <Progress
        value={(currentStep / 3) * 100}
        className="mb-8"
      />
      
      {/* Step 1: Template Selection */}
      {currentStep === 1 && (
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">1. Select Agent Template</h2>
          <div className="grid grid-cols-3 gap-4">
            {templates.map(template => (
              <Card
                key={template.id}
                className="p-4 cursor-pointer hover:shadow-lg"
                onClick={() => handleTemplateSelect(template.id)}
              >
                <h3 className="font-bold">{template.name}</h3>
                <p className="text-sm text-gray-600">{template.description}</p>
              </Card>
            ))}
          </div>
        </Card>
      )}
      
      {/* Step 2: Customer Assignment */}
      {currentStep === 2 && (
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">2. Select Customer</h2>
          <Select
            options={customers.map(c => ({
              value: c.id,
              label: `${c.name} (${c.organization})`
            }))}
            onChange={handleCustomerSelect}
            placeholder="Select customer..."
          />
        </Card>
      )}
      
      {/* Step 3: Deployment Confirmation */}
      {currentStep === 3 && (
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">3. Confirm Deployment</h2>
          <Input
            placeholder="Enter deployment name..."
            value={deploymentName}
            onChange={e => setDeploymentName(e.target.value)}
            className="mb-4"
          />
          <Button
            onClick={handleDeploy}
            disabled={isLoading || !deploymentName}
            className="w-full"
          >
            {isLoading ? 'Deploying...' : 'Deploy Agent'}
          </Button>
        </Card>
      )}
    </div>
  );
};

export default AgentHubDashboard;