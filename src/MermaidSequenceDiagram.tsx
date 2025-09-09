import { useState, useCallback, useMemo, useEffect } from 'react';
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
  const getMessageStyle = () => {
    switch (data.messageType) {
      case 'request':
        return {
          background: '#e8f5e8',
          border: '2px solid #2e7d32',
          color: '#2e7d32'
        };
      case 'response':
        return {
          background: '#f3e5f5',
          border: '2px solid #7b1fa2',
          color: '#7b1fa2'
        };
      case 'note':
        return {
          background: '#fff3e0',
          border: '2px solid #f57c00',
          color: '#f57c00'
        };
      case 'activation':
        return {
          background: '#e0f2f1',
          border: '2px solid #00695c',
          color: '#00695c'
        };
      default:
        return {
          background: '#f5f5f5',
          border: '2px solid #666',
          color: '#666'
        };
    }
  };

  const style = getMessageStyle();

  return (
    <div style={{
      width: 200,
      height: 30,
      ...style,
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '500',
      fontSize: '12px',
      position: 'relative'
    }}>
      {data.label}
      {data.messageType === 'request' && <span style={{ position: 'absolute', right: '5px' }}>→</span>}
      {data.messageType === 'response' && <span style={{ position: 'absolute', left: '5px' }}>←</span>}
      
      {/* Add handles for React Flow */}
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
      {/* Add handles for React Flow */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{ background: '#666', width: 8, height: 8 }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{ background: '#666', width: 8, height: 8 }}
      />
    </div>
  );
};

const nodeTypes = {
  actor: ActorNode,
  message: MessageNode,
  lifeline: LifelineNode,
};

// Mermaid parser
const parseMermaidSequence = (mermaidText: string) => {
  const lines = mermaidText.split('\n').map(line => line.trim()).filter(line => line);
  
  if (!lines[0]?.startsWith('sequenceDiagram')) {
    throw new Error('Invalid Mermaid sequence diagram format');
  }

  const actors = new Set<string>();
  const messages: Array<{
    from: string;
    to: string;
    message: string;
    type: 'request' | 'response' | 'note' | 'activation';
  }> = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    
    // Parse actor definitions
    if (line.includes('participant')) {
      const match = line.match(/participant\s+(\w+)/);
      if (match) actors.add(match[1]);
    }
    
    // Parse messages
    if (line.includes('->>') || line.includes('->') || line.includes('-->>') || line.includes('-->')) {
      console.log('Processing message line:', line);
      const isResponse = line.includes('-->>') || line.includes('-->');
      const isNote = line.includes('Note');
      
      let match;
      if (isNote) {
        match = line.match(/Note\s+(?:over\s+(\w+)(?:,\s*(\w+))?)?\s*:\s*(.+)/);
        console.log('Note match:', match);
        if (match) {
          const [, from, to, message] = match;
          if (from) {
            actors.add(from);
            messages.push({
              from,
              to: to || from,
              message,
              type: 'note'
            });
            console.log('Added note message:', { from, to: to || from, message, type: 'note' });
          }
        }
      } else {
        // Updated regex to handle the exact Mermaid syntax
        match = line.match(/(\w+)\s*(?:->>|-->>)\s*(\w+)\s*:\s*(.+)/);
        console.log('Message match:', match);
        if (match) {
          const [, from, to, message] = match;
          actors.add(from);
          actors.add(to);
          messages.push({
            from,
            to,
            message,
            type: isResponse ? 'response' : 'request'
          });
          console.log('Added message:', { from, to, message, type: isResponse ? 'response' : 'request' });
        }
      }
    }
    
    // Parse activations
    if (line.includes('activate') || line.includes('deactivate')) {
      const match = line.match(/(?:activate|deactivate)\s+(\w+)/);
      if (match) {
        const [, actor] = match;
        actors.add(actor);
        messages.push({
          from: actor,
          to: actor,
          message: line.includes('activate') ? 'Activate' : 'Deactivate',
          type: 'activation'
        });
      }
    }
  }

  return { actors: Array.from(actors), messages };
};

// Convert parsed data to React Flow nodes and edges
const convertToReactFlow = (parsedData: { actors: string[], messages: any[] }) => {
  const { actors, messages } = parsedData;
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Create actor nodes
  actors.forEach((actor, index) => {
    nodes.push({
      id: actor,
      type: 'actor',
      data: { label: actor },
      position: { x: 50 + index * 200, y: 50 },
    });

    // Create lifeline nodes
    nodes.push({
      id: `${actor}-lifeline`,
      type: 'lifeline',
      data: { height: 500 },
      position: { x: 110 + index * 200, y: 100 },
    });
  });

  // Create message nodes and edges
  messages.forEach((msg, index) => {
    const fromIndex = actors.indexOf(msg.from);
    const toIndex = actors.indexOf(msg.to);
    
    if (fromIndex === -1 || toIndex === -1) return;

    const messageId = `msg-${index}`;
    const yPosition = 150 + index * 60;

    // Create message node
    nodes.push({
      id: messageId,
      type: 'message',
      data: { 
        label: msg.message, 
        messageType: msg.type 
      },
      position: { 
        x: Math.min(150 + fromIndex * 200, 150 + toIndex * 200), 
        y: yPosition 
      },
    });

    // Create edges
    const fromLifeline = `${msg.from}-lifeline`;
    const toLifeline = `${msg.to}-lifeline`;
    
    if (msg.type === 'note') {
      // Note spans across actors
      edges.push({
        id: `e-${messageId}-1`,
        source: fromLifeline,
        sourceHandle: 'right',
        target: messageId,
        targetHandle: 'left',
        type: 'straight',
        style: { 
          stroke: '#f57c00', 
          strokeWidth: 2,
          strokeDasharray: '5,5'
        }
      });
      
      edges.push({
        id: `e-${messageId}-2`,
        source: messageId,
        sourceHandle: 'right',
        target: toLifeline,
        targetHandle: 'left',
        type: 'straight',
        style: { 
          stroke: '#f57c00', 
          strokeWidth: 2,
          strokeDasharray: '5,5'
        }
      });
    } else {
      // Regular message flow
      edges.push({
        id: `e-${messageId}-1`,
        source: fromLifeline,
        sourceHandle: 'right',
        target: messageId,
        targetHandle: 'left',
        type: 'straight',
        style: { 
          stroke: msg.type === 'response' ? '#7b1fa2' : '#2e7d32', 
          strokeWidth: 2,
          strokeDasharray: msg.type === 'response' ? '5,5' : 'none'
        }
      });
      
      edges.push({
        id: `e-${messageId}-2`,
        source: messageId,
        sourceHandle: 'right',
        target: toLifeline,
        targetHandle: 'left',
        type: 'straight',
        style: { 
          stroke: msg.type === 'response' ? '#7b1fa2' : '#2e7d32', 
          strokeWidth: 2,
          strokeDasharray: msg.type === 'response' ? '5,5' : 'none'
        }
      });
    }
  });

  return { nodes, edges };
};

const MermaidSequenceDiagram = () => {
  const [mermaidText, setMermaidText] = useState(`sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant D as Database
    
    U->>F: Login Request
    F->>B: Authenticate User
    B->>D: Query User Data
    D-->>B: User Data
    B-->>F: Auth Token
    F-->>U: Login Success
    
    Note over U,D: User authentication flow`);

  // Test regex manually
  const testLine = "U->>F: Login Request";
  const testMatch = testLine.match(/(\w+)\s*->>\s*(\w+)\s*:\s*(.+)/);
  console.log('Manual regex test:', { testLine, testMatch });

  const { nodes, edges } = useMemo(() => {
    try {
      console.log('=== PARSING MERMAID ===');
      console.log('Input text:', mermaidText);
      
      const parsed = parseMermaidSequence(mermaidText);
      console.log('Parsed actors:', parsed.actors);
      console.log('Parsed messages:', parsed.messages);
      
      const result = convertToReactFlow(parsed);
      console.log('Generated nodes:', result.nodes);
      console.log('Generated edges:', result.edges);
      console.log('=== END PARSING ===');
      
      return result;
    } catch (error) {
      console.error('Error parsing Mermaid:', error);
      return { nodes: [], edges: [] };
    }
  }, [mermaidText]);

  const [reactFlowNodes, setNodes, onNodesChange] = useNodesState(nodes);
  const [reactFlowEdges, setEdges, onEdgesChange] = useEdgesState(edges);
  
  // Update nodes and edges when they change
  useEffect(() => {
    setNodes(nodes);
  }, [nodes, setNodes]);
  
  useEffect(() => {
    setEdges(edges);
  }, [edges, setEdges]);
  
  console.log('Current React Flow nodes:', reactFlowNodes);
  console.log('Current React Flow edges:', reactFlowEdges);
  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex' }}>
      {/* Mermaid Input Panel */}
      <div style={{ 
        width: '300px', 
        background: '#f5f5f5', 
        padding: '20px',
        borderRight: '1px solid #ddd',
        overflow: 'auto'
      }}>
        <h3 style={{ marginTop: 0, color: '#333' }}>Mermaid Sequence Diagram</h3>
        <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
          Enter Mermaid sequence diagram syntax:
        </p>
        <textarea
          value={mermaidText}
          onChange={(e) => setMermaidText(e.target.value)}
          style={{
            width: '100%',
            height: '400px',
            fontFamily: 'monospace',
            fontSize: '12px',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            resize: 'vertical'
          }}
          placeholder="Enter Mermaid sequence diagram syntax..."
        />
        <div style={{ marginTop: '10px', fontSize: '11px', color: '#666' }}>
          <strong>Supported syntax:</strong>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>participant A as Actor</li>
            <li>A-&gt;&gt;B: Message</li>
            <li>A--&gt;&gt;B: Response</li>
            <li>Note over A,B: Note text</li>
            <li>activate A</li>
            <li>deactivate A</li>
          </ul>
        </div>
      </div>

      {/* React Flow Diagram */}
      <div style={{ flex: 1 }}>
        <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'white', padding: '10px', border: '1px solid #ccc', zIndex: 1000 }}>
          <div>Nodes: {reactFlowNodes.length}</div>
          <div>Edges: {reactFlowEdges.length}</div>
        </div>
        <ReactFlow
          nodes={reactFlowNodes}
          edges={reactFlowEdges}
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
    </div>
  );
};

export default MermaidSequenceDiagram;
