import React from 'react';
import { mount } from './App';

// Use the mount function with default settings
const container = document.getElementById('root')!;

// Derive initial room from URL if present to avoid connecting to a default room first
const params = new URLSearchParams(window.location.search);
const urlRoomId = params.get('room') || undefined;

mount(container, {
  showControls: true, // Enable the built-in mode selection controls
  viewMode: '2d-schematic', // Default to 2D schematic mode with UI overlay
  difficulty: 'medium',
  theme: 'light',
  playerCount: 1,
  autoRotate: true,
  ...(urlRoomId ? { roomId: urlRoomId } : {})
});
