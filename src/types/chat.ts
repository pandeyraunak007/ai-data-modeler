// Chat types for AI Data Modeler

import { ModelChange } from './model';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  modelChanges?: ModelChange[];           // Track what changed
  error?: string;
}

export interface Suggestion {
  id: string;
  label: string;
  prompt: string;
  icon?: string;
}

// Default suggestions for the chat
export const DEFAULT_SUGGESTIONS: Suggestion[] = [
  {
    id: '1',
    label: 'Add audit fields',
    prompt: 'Add created_at and updated_at timestamp fields to all entities',
    icon: 'clock',
  },
  {
    id: '2',
    label: 'Add indexes',
    prompt: 'Suggest indexes for frequently queried columns',
    icon: 'zap',
  },
  {
    id: '3',
    label: 'Normalize',
    prompt: 'Check for normalization issues and suggest improvements',
    icon: 'layers',
  },
  {
    id: '4',
    label: 'Generate DDL',
    prompt: 'Generate the DDL/SQL script for this model',
    icon: 'code',
  },
];

// Example prompts for landing page
export const EXAMPLE_PROMPTS = [
  {
    title: 'E-Commerce Platform',
    prompt: 'Create a database for an e-commerce platform with users, products, categories, orders, order items, reviews, and a shopping cart',
    icon: 'shopping-cart',
  },
  {
    title: 'Social Media App',
    prompt: 'Design a social media database with users, posts, comments, likes, followers, and direct messages',
    icon: 'users',
  },
  {
    title: 'Project Management',
    prompt: 'Create a project management database with organizations, teams, users, projects, tasks, comments, and time tracking',
    icon: 'folder',
  },
  {
    title: 'Healthcare System',
    prompt: 'Design a healthcare database with patients, doctors, appointments, medical records, prescriptions, and billing',
    icon: 'heart',
  },
  {
    title: 'Learning Platform',
    prompt: 'Create a database for an online learning platform with courses, instructors, students, lessons, quizzes, and certificates',
    icon: 'book',
  },
  {
    title: 'Inventory System',
    prompt: 'Design an inventory management database with products, warehouses, stock levels, suppliers, purchase orders, and shipments',
    icon: 'package',
  },
];
