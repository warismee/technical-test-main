import React from 'react';
import { mount } from './App';

// Use the mount function with default settings
const container = document.getElementById('root')!;
mount(container, {
  showControls: true, // Enable the built-in mode selection controls
  viewMode: '2d-schematic', // Default to 2D schematic mode with UI overlay
  difficulty: 'medium',
  theme: 'light',
  playerCount: 1,
  autoRotate: true,
  roomId: 'demo-circuit-room'
});
