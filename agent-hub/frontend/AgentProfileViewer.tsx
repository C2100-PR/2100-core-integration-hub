import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Badge,
  LineChart,
  Button,
  Alert
} from '@/components/ui';
import { Activity, Brain, Cpu, Database, Network, Settings } from 'lucide-react';

interface AgentProfile {
  name: string;
  endpoint_id: string;
  region: string;
  capabilities: string[];
  specialization: string;
  version?: string;
  metrics?: {
    response_time: number[];
    usage: number[];
    error_rate: number[];
  };
}

interface AgentMetrics {
  daily: {
    timestamps: string[];
    values: {
      response_time: number[];
      usage: number[];
      error_rate: number[];
    };
  };
}

const AgentProfileViewer: React.FC<{ agentId: string }> = ({ agentId }) => {
  const [agent, setAgent] = useState<AgentProfile | null>(null);
  const [metrics, setMetrics] = useState<AgentMetrics | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        const [agentData, metricsData] = await Promise.all([
          fetch(`/api/agent-hub/agents/${agentId}`).then(res => res.json()),
          fetch(`/api/agent-hub/agents/${agentId}/metrics`).then(res => res.json())
        ]);
        
        setAgent(agentData);
        setMetrics(metricsData);
      } catch (error) {
        Alert.error('Failed to load agent data');
      }
    };
    
    fetchAgentData();
  }, [agentId]);

  if (!agent) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{agent.name}</h1>
          <p className="text-gray-600 mb-2">Endpoint ID: {agent.endpoint_id}</p>
          <Badge variant="outline" className="mr-2">
            {agent.region}
          </Badge>
          <Badge variant="outline">
            {agent.version || 'Latest'}
          </Badge>
        </div>
        
        <Button
          variant="outline"
          onClick={() => {/* Add deployment handler */}}
        >
          Deploy Instance
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Trigger value="overview">
            <Brain className="mr-2" />
            Overview
          </Tabs.Trigger>
          <Tabs.Trigger value="capabilities">
            <Cpu className="mr-2" />
            Capabilities
          </Tabs.Trigger>
          <Tabs.Trigger value="metrics">
            <Activity className="mr-2" />
            Performance
          </Tabs.Trigger>
          <Tabs.Trigger value="integration">
            <Network className="mr-2" />
            Integration
          </Tabs.Trigger>
          <Tabs.Trigger value="config">
            <Settings className="mr-2" />
            Configuration
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="overview">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Agent Overview</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Specialization</h3>
                <p>{agent.specialization}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Region</h3>
                <p>{agent.region}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Status</h3>
                <Badge variant="success">Active</Badge>
              </div>
              <div>
                <h3 className="font-medium mb-2">Version</h3>
                <p>{agent.version || 'Latest Release'}</p>
              </div>
            </div>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="capabilities">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Capabilities</h2>
            <div className="grid grid-cols-2 gap-4">
              {agent.capabilities.map((capability, index) => (
                <Card key={index} className="p-4">
                  <h3 className="font-medium mb-2">
                    {capability.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {/* Add capability descriptions */}
                  </p>
                </Card>
              ))}
            </div>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="metrics">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
            {metrics && (
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Response Time</h3>
                  <LineChart
                    data={metrics.daily.timestamps.map((timestamp, i) => ({
                      timestamp,
                      value: metrics.daily.values.response_time[i]
                    }))}
                    xAxis="timestamp"
                    yAxis="value"
                  />
                </div>
                <div>
                  <h3 className="font-medium mb-2">Usage</h3>
                  <LineChart
                    data={metrics.daily.timestamps.map((timestamp, i) => ({
                      timestamp,
                      value: metrics.daily.values.usage[i]
                    }))}
                    xAxis="timestamp"
                    yAxis="value"
                  />
                </div>
                <div>
                  <h3 className="font-medium mb-2">Error Rate</h3>
                  <LineChart
                    data={metrics.daily.timestamps.map((timestamp, i) => ({
                      timestamp,
                      value: metrics.daily.values.error_rate[i]
                    }))}
                    xAxis="timestamp"
                    yAxis="value"
                  />
                </div>
              </div>
            )}
          </Card>
        </Tabs.Content>

        <Tabs.Content value="integration">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Integration Guide</h2>
            <div className="mb-6">
              <h3 className="font-medium mb-2">Endpoint URL</h3>
              <code className="block p-3 bg-gray-100 rounded">
                https://{agent.region}-aiplatform.googleapis.com/v1/projects/api-for-warp-drive/locations/{agent.region}/endpoints/{agent.endpoint_id}
              </code>
            </div>
            <div className="mb-6">
              <h3 className="font-medium mb-2">Authentication</h3>
              <p>Use OAuth 2.0 for authentication. Required scopes:</p>
              <ul className="list-disc ml-6 mt-2">
                <li>https://www.googleapis.com/auth/cloud-platform</li>
                <li>https://www.googleapis.com/auth/cloud-language</li>
              </ul>
            </div>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="config">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Configuration</h2>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <h3 className="font-medium mb-2">Model Settings</h3>
                <pre className="bg-gray-100 p-3 rounded">
                  {JSON.stringify({
                    temperature: 0.7,
                    maxOutputTokens: 1024,
                    topP: 0.8,
                    topK: 40
                  }, null, 2)}
                </pre>
              </Card>
              <Card className="p-4">
                <h3 className="font-medium mb-2">Resource Allocation</h3>
                <pre className="bg-gray-100 p-3 rounded">
                  {JSON.stringify({
                    minReplicas: 1,
                    maxReplicas: 10,
                    accelerator: "GPU",
                    machineType: "n1-standard-4"
                  }, null, 2)}
                </pre>
              </Card>
            </div>
          </Card>
        </Tabs.Content>
      </Tabs>
    </div>
  );
};

export default AgentProfileViewer;