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
  Handle,
  Position,
} from '@xyflow/react';

// Custom node component for different technology types
const TechNode = ({ data }: { data: any }) => {
  const getTechStyle = () => {
    switch (data.technology) {
      case 'Node.js':
        return {
          background: '#68d391',
          border: '2px solid #38a169',
          color: '#1a202c'
        };
      case 'Python':
        return {
          background: '#fbb6ce',
          border: '2px solid #e53e3e',
          color: '#1a202c'
        };
      case 'Java':
        return {
          background: '#fbd38d',
          border: '2px solid #dd6b20',
          color: '#1a202c'
        };
      default:
        return {
          background: '#e2e8f0',
          border: '2px solid #718096',
          color: '#1a202c'
        };
    }
  };

  const style = getTechStyle();

  return (
    <div style={{
      width: 180,
      height: 80,
      ...style,
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '14px',
      position: 'relative',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ fontSize: '16px', marginBottom: '4px' }}>
        {data.label}
      </div>
      <div style={{ 
        fontSize: '12px', 
        fontWeight: 'normal',
        opacity: 0.8,
        background: 'rgba(255, 255, 255, 0.2)',
        padding: '2px 8px',
        borderRadius: '4px'
      }}>
        {data.technology}
      </div>
      
      {/* Add handles for React Flow */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{ background: '#666', width: 8, height: 8 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{ background: '#666', width: 8, height: 8 }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{ background: '#666', width: 8, height: 8 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{ background: '#666', width: 8, height: 8 }}
      />
    </div>
  );
};

const nodeTypes = {
  tech: TechNode,
};

const initialNodes: Node[] = [
  // Top Row - Controllers & Services
  {
    id: 'user-controller',
    type: 'tech',
    data: { label: 'UserController', technology: 'Node.js' },
    position: { x: 100, y: 50 },
  },
  {
    id: 'user-service',
    type: 'tech',
    data: { label: 'UserService', technology: 'Node.js' },
    position: { x: 350, y: 50 },
  },
  {
    id: 'user-repository',
    type: 'tech',
    data: { label: 'UserRepository', technology: 'Node.js' },
    position: { x: 600, y: 50 },
  },
  {
    id: 'product-controller',
    type: 'tech',
    data: { label: 'ProductController', technology: 'Python' },
    position: { x: 850, y: 50 },
  },

  // Second Row - Services & Repositories
  {
    id: 'product-service',
    type: 'tech',
    data: { label: 'ProductService', technology: 'Python' },
    position: { x: 100, y: 200 },
  },
  {
    id: 'product-repository',
    type: 'tech',
    data: { label: 'ProductRepository', technology: 'Python' },
    position: { x: 350, y: 200 },
  },
  {
    id: 'order-controller',
    type: 'tech',
    data: { label: 'OrderController', technology: 'Java' },
    position: { x: 600, y: 200 },
  },
  {
    id: 'order-service',
    type: 'tech',
    data: { label: 'OrderService', technology: 'Java' },
    position: { x: 850, y: 200 },
  },

  // Third Row - Repositories & Controllers/Services
  {
    id: 'order-repository',
    type: 'tech',
    data: { label: 'OrderRepository', technology: 'Java' },
    position: { x: 100, y: 350 },
  },
  {
    id: 'payment-controller',
    type: 'tech',
    data: { label: 'PaymentController', technology: 'Node.js' },
    position: { x: 350, y: 350 },
  },
  {
    id: 'payment-service',
    type: 'tech',
    data: { label: 'PaymentService', technology: 'Node.js' },
    position: { x: 600, y: 350 },
  },
  {
    id: 'payment-repository',
    type: 'tech',
    data: { label: 'PaymentRepository', technology: 'Node.js' },
    position: { x: 850, y: 350 },
  },

  // Bottom Row - Middleware
  {
    id: 'auth-middleware',
    type: 'tech',
    data: { label: 'AuthMiddleware', technology: 'Node.js' },
    position: { x: 100, y: 500 },
  },
  {
    id: 'validation-middleware',
    type: 'tech',
    data: { label: 'ValidationMiddleware', technology: 'Python' },
    position: { x: 350, y: 500 },
  },
];

const initialEdges: Edge[] = [
  // User flow
  {
    id: 'e1',
    source: 'user-controller',
    sourceHandle: 'right',
    target: 'user-service',
    targetHandle: 'left',
    type: 'smoothstep',
    label: 'uses',
    style: { stroke: '#2d3748', strokeWidth: 2 },
    labelStyle: { fill: '#2d3748', fontWeight: 600 }
  },
  {
    id: 'e2',
    source: 'user-service',
    sourceHandle: 'right',
    target: 'user-repository',
    targetHandle: 'left',
    type: 'smoothstep',
    label: 'calls',
    style: { stroke: '#2d3748', strokeWidth: 2 },
    labelStyle: { fill: '#2d3748', fontWeight: 600 }
  },

  // Product flow
  {
    id: 'e3',
    source: 'product-controller',
    sourceHandle: 'left',
    target: 'product-repository',
    targetHandle: 'right',
    type: 'smoothstep',
    label: 'uses',
    style: { stroke: '#2d3748', strokeWidth: 2 },
    labelStyle: { fill: '#2d3748', fontWeight: 600 }
  },
  {
    id: 'e4',
    source: 'product-service',
    sourceHandle: 'right',
    target: 'product-repository',
    targetHandle: 'left',
    type: 'smoothstep',
    label: 'calls',
    style: { stroke: '#2d3748', strokeWidth: 2 },
    labelStyle: { fill: '#2d3748', fontWeight: 600 }
  },

  // Order flow
  {
    id: 'e5',
    source: 'order-controller',
    sourceHandle: 'right',
    target: 'order-service',
    targetHandle: 'left',
    type: 'smoothstep',
    label: 'uses',
    style: { stroke: '#2d3748', strokeWidth: 2 },
    labelStyle: { fill: '#2d3748', fontWeight: 600 }
  },
  {
    id: 'e6',
    source: 'order-service',
    sourceHandle: 'left',
    target: 'order-repository',
    targetHandle: 'right',
    type: 'smoothstep',
    label: 'calls',
    style: { stroke: '#2d3748', strokeWidth: 2 },
    labelStyle: { fill: '#2d3748', fontWeight: 600 }
  },
  {
    id: 'e7',
    source: 'order-service',
    sourceHandle: 'bottom',
    target: 'payment-service',
    targetHandle: 'top',
    type: 'smoothstep',
    label: 'calls',
    style: { stroke: '#2d3748', strokeWidth: 2 },
    labelStyle: { fill: '#2d3748', fontWeight: 600 }
  },

  // Payment flow
  {
    id: 'e8',
    source: 'payment-controller',
    sourceHandle: 'right',
    target: 'payment-service',
    targetHandle: 'left',
    type: 'smoothstep',
    label: 'uses',
    style: { stroke: '#2d3748', strokeWidth: 2 },
    labelStyle: { fill: '#2d3748', fontWeight: 600 }
  },
  {
    id: 'e9',
    source: 'payment-service',
    sourceHandle: 'right',
    target: 'payment-repository',
    targetHandle: 'left',
    type: 'smoothstep',
    label: 'calls',
    style: { stroke: '#2d3748', strokeWidth: 2 },
    labelStyle: { fill: '#2d3748', fontWeight: 600 }
  },

  // Middleware protection
  {
    id: 'e10',
    source: 'auth-middleware',
    sourceHandle: 'top',
    target: 'order-repository',
    targetHandle: 'bottom',
    type: 'smoothstep',
    label: 'protects',
    style: { stroke: '#e53e3e', strokeWidth: 2, strokeDasharray: '5,5' },
    labelStyle: { fill: '#e53e3e', fontWeight: 600 }
  },

  // Cross-service dependencies
  {
    id: 'e11',
    source: 'product-service',
    sourceHandle: 'bottom',
    target: 'validation-middleware',
    targetHandle: 'top',
    type: 'smoothstep',
    label: 'uses',
    style: { stroke: '#805ad5', strokeWidth: 2, strokeDasharray: '3,3' },
    labelStyle: { fill: '#805ad5', fontWeight: 600 }
  },
  {
    id: 'e12',
    source: 'product-service',
    sourceHandle: 'bottom',
    target: 'auth-middleware',
    targetHandle: 'top',
    type: 'smoothstep',
    label: 'uses',
    style: { stroke: '#805ad5', strokeWidth: 2, strokeDasharray: '3,3' },
    labelStyle: { fill: '#805ad5', fontWeight: 600 }
  },
];

const DependencyGraph = () => {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div style={{ 
        position: 'absolute', 
        top: '10px', 
        left: '10px', 
        background: 'white', 
        padding: '10px', 
        border: '1px solid #ccc', 
        borderRadius: '4px',
        zIndex: 1000,
        fontSize: '12px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Code Dependency Graph</div>
        <div>Nodes: {nodes.length}</div>
        <div>Edges: {edges.length}</div>
        <div style={{ marginTop: '5px', fontSize: '10px', color: '#666' }}>
          Polyglot Architecture (Node.js, Python, Java)
        </div>
      </div>
      
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
        <MiniMap 
          nodeColor={(node) => {
            switch (node.data?.technology) {
              case 'Node.js': return '#68d391';
              case 'Python': return '#fbb6ce';
              case 'Java': return '#fbd38d';
              default: return '#e2e8f0';
            }
          }}
          nodeBorderRadius={4}
        />
      </ReactFlow>
    </div>
  );
};

export default DependencyGraph;
