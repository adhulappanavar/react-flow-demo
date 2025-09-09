import { useCallback } from 'react';
import {
  ReactFlow,
  addEdge,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  ConnectionMode,
} from '@xyflow/react';

// Custom node component for actors
const ActorNode = ({ data }: { data: any }) => {
  return (
    <div style={{
      width: 120,
      height: 40,
      background: '#e1f5fe',
      border: '2px solid #01579b',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      color: '#01579b',
      fontSize: '14px'
    }}>
      {data.label}
    </div>
  );
};

// Custom node component for messages
const MessageNode = ({ data }: { data: any }) => {
  return (
    <div style={{
      width: 200,
      height: 30,
      background: data.type === 'response' ? '#f3e5f5' : '#e8f5e8',
      border: `2px solid ${data.type === 'response' ? '#7b1fa2' : '#2e7d32'}`,
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '500',
      color: data.type === 'response' ? '#7b1fa2' : '#2e7d32',
      fontSize: '12px',
      position: 'relative'
    }}>
      {data.label}
      {data.type === 'request' && <span style={{ position: 'absolute', right: '5px' }}>→</span>}
      {data.type === 'response' && <span style={{ position: 'absolute', left: '5px' }}>←</span>}
    </div>
  );
};

// Custom node component for lifelines
const LifelineNode = ({ data }: { data: any }) => {
  return (
    <div style={{
      width: 4,
      height: data.height || 400,
      background: '#666',
      position: 'relative',
      margin: '0 auto'
    }}>
      <div style={{
        width: 20,
        height: 20,
        background: '#666',
        borderRadius: '50%',
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)'
      }} />
    </div>
  );
};

const nodeTypes = {
  actor: ActorNode,
  message: MessageNode,
  lifeline: LifelineNode,
};

const initialNodes: Node[] = [
  // Actors
  {
    id: 'user',
    type: 'actor',
    data: { label: 'User' },
    position: { x: 50, y: 50 },
  },
  {
    id: 'frontend',
    type: 'actor',
    data: { label: 'Frontend' },
    position: { x: 250, y: 50 },
  },
  {
    id: 'backend',
    type: 'actor',
    data: { label: 'Backend' },
    position: { x: 450, y: 50 },
  },
  {
    id: 'database',
    type: 'actor',
    data: { label: 'Database' },
    position: { x: 650, y: 50 },
  },

  // Lifelines
  {
    id: 'user-lifeline',
    type: 'lifeline',
    data: { height: 500 },
    position: { x: 110, y: 100 },
  },
  {
    id: 'frontend-lifeline',
    type: 'lifeline',
    data: { height: 500 },
    position: { x: 310, y: 100 },
  },
  {
    id: 'backend-lifeline',
    type: 'lifeline',
    data: { height: 500 },
    position: { x: 510, y: 100 },
  },
  {
    id: 'database-lifeline',
    type: 'lifeline',
    data: { height: 500 },
    position: { x: 710, y: 100 },
  },

  // Messages
  {
    id: 'login-request',
    type: 'message',
    data: { label: 'Login Request', type: 'request' },
    position: { x: 150, y: 150 },
  },
  {
    id: 'auth-request',
    type: 'message',
    data: { label: 'Authenticate User', type: 'request' },
    position: { x: 350, y: 200 },
  },
  {
    id: 'db-query',
    type: 'message',
    data: { label: 'Query User Data', type: 'request' },
    position: { x: 550, y: 250 },
  },
  {
    id: 'db-response',
    type: 'message',
    data: { label: 'User Data', type: 'response' },
    position: { x: 550, y: 300 },
  },
  {
    id: 'auth-response',
    type: 'message',
    data: { label: 'Auth Token', type: 'response' },
    position: { x: 350, y: 350 },
  },
  {
    id: 'login-response',
    type: 'message',
    data: { label: 'Login Success', type: 'response' },
    position: { x: 150, y: 400 },
  },
];

const initialEdges: Edge[] = [
  // User to Frontend
  { 
    id: 'e1', 
    source: 'user-lifeline', 
    target: 'login-request',
    type: 'straight',
    style: { stroke: '#2e7d32', strokeWidth: 2 }
  },
  { 
    id: 'e2', 
    source: 'login-request', 
    target: 'frontend-lifeline',
    type: 'straight',
    style: { stroke: '#2e7d32', strokeWidth: 2 }
  },

  // Frontend to Backend
  { 
    id: 'e3', 
    source: 'frontend-lifeline', 
    target: 'auth-request',
    type: 'straight',
    style: { stroke: '#2e7d32', strokeWidth: 2 }
  },
  { 
    id: 'e4', 
    source: 'auth-request', 
    target: 'backend-lifeline',
    type: 'straight',
    style: { stroke: '#2e7d32', strokeWidth: 2 }
  },

  // Backend to Database
  { 
    id: 'e5', 
    source: 'backend-lifeline', 
    target: 'db-query',
    type: 'straight',
    style: { stroke: '#2e7d32', strokeWidth: 2 }
  },
  { 
    id: 'e6', 
    source: 'db-query', 
    target: 'database-lifeline',
    type: 'straight',
    style: { stroke: '#2e7d32', strokeWidth: 2 }
  },

  // Database response
  { 
    id: 'e7', 
    source: 'database-lifeline', 
    target: 'db-response',
    type: 'straight',
    style: { stroke: '#7b1fa2', strokeWidth: 2, strokeDasharray: '5,5' }
  },
  { 
    id: 'e8', 
    source: 'db-response', 
    target: 'backend-lifeline',
    type: 'straight',
    style: { stroke: '#7b1fa2', strokeWidth: 2, strokeDasharray: '5,5' }
  },

  // Backend response
  { 
    id: 'e9', 
    source: 'backend-lifeline', 
    target: 'auth-response',
    type: 'straight',
    style: { stroke: '#7b1fa2', strokeWidth: 2, strokeDasharray: '5,5' }
  },
  { 
    id: 'e10', 
    source: 'auth-response', 
    target: 'frontend-lifeline',
    type: 'straight',
    style: { stroke: '#7b1fa2', strokeWidth: 2, strokeDasharray: '5,5' }
  },

  // Frontend response
  { 
    id: 'e11', 
    source: 'frontend-lifeline', 
    target: 'login-response',
    type: 'straight',
    style: { stroke: '#7b1fa2', strokeWidth: 2, strokeDasharray: '5,5' }
  },
  { 
    id: 'e12', 
    source: 'login-response', 
    target: 'user-lifeline',
    type: 'straight',
    style: { stroke: '#7b1fa2', strokeWidth: 2, strokeDasharray: '5,5' }
  },
];

const SequenceDiagram = () => {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        connectionMode={ConnectionMode.Strict}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        attributionPosition="top-right"
      >
        <Background gap={20} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};

export default SequenceDiagram;
