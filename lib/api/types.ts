// Common API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ErrorResponse {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// User types
export interface User {
  id: number;
  fullName: string;
  email: string;
  mobile?: string;
  profilePictureUrl?: string;
  bio?: string;
  role: 'CLIENT' | 'PROFESSIONAL' | 'ADMIN';
  primaryCategory?: string;
  skills?: string[];
  hourlyRate?: number;
  location?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalTasksPosted: number;
  totalTasksCompleted: number;
  totalEarned: number;
  totalSpent: number;
  successRate: number;
  averageResponseTime: number;
}

// Task/Gig types
export interface Task {
  id: number;
  title: string;
  description: string;
  category: string;
  budget: number;
  budgetType: 'FIXED' | 'HOURLY';
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  deadline?: string;
  clientId: number;
  assignedProfessionalId?: number;
  tags?: string[];
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  category: string;
  budget: number;
  budgetType: 'FIXED' | 'HOURLY';
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  deadline?: string;
  tags?: string[];
}

// Proposal types
export interface Proposal {
  id: number;
  taskId: number;
  professionalId: number;
  coverLetter: string;
  proposedAmount: number;
  estimatedDuration: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export interface CreateProposalRequest {
  taskId: number;
  coverLetter: string;
  proposedAmount: number;
  estimatedDuration: number;
}

// Review types
export interface Review {
  id: number;
  taskId: number;
  reviewerId: number;
  revieweeId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AverageRatingResponse {
  userId: number;
  averageRating: number;
  totalReviews: number;
}

export interface CreateReviewRequest {
  taskId: number;
  revieweeId: number;
  rating: number;
  comment: string;
}

// Chat types
export interface ChatThread {
  id: number;
  user1Id: number;
  user2Id: number;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCountUser1: number;
  unreadCountUser2: number;
  createdAt: string;
}

export interface Message {
  id: number;
  threadId: number;
  senderId: number;
  receiverId: number;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE';
  isRead: boolean;
  sentAt: string;
}

export interface SendMessageRequest {
  receiverId: number;
  content: string;
  messageType?: 'TEXT' | 'IMAGE' | 'FILE';
}

// Category types
export interface Category {
  id: number;
  name: string;
  description?: string;
  iconUrl?: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: 'CLIENT' | 'PROFESSIONAL';
}

export interface AuthResponse {
  token: string;
  user: User;
}
