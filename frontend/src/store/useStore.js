import { create } from 'zustand';

export const useStore = create((set, get) => ({
  nodes: [],
  edges: [],
  workflowResults: {},

  addNode: (node) =>
    set((state) => ({
      nodes: [...state.nodes, node],
    })),

  updateNodeData: (nodeId, data) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, config: data } }
          : node
      ),
    })),

  removeNode: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== nodeId),
    })),

  setWorkflowResults: (results) =>
    set({
      workflowResults: results,
    }),

  clearWorkflow: () =>
    set({
      nodes: [],
      edges: [],
      workflowResults: {},
    }),

  // Utility functions
  getNode: (nodeId) => {
    const state = get();
    return state.nodes.find((node) => node.id === nodeId);
  },

  getConnectedNodes: (nodeId) => {
    const state = get();
    const connectedEdges = state.edges.filter(
      (edge) => edge.source === nodeId || edge.target === nodeId
    );
    
    return connectedEdges.map((edge) => {
      const targetNodeId = edge.source === nodeId ? edge.target : edge.source;
      return state.nodes.find((node) => node.id === targetNodeId);
    }).filter(Boolean);
  },
}));