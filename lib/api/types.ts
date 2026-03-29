// Common API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

/** Spring Data Page JSON shape */
export interface SpringPage<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
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
  /** Comma-separated from API */
  skills?: string;
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

// Task/Gig types (aligned with task-service TaskResponseDTO)
export interface Task {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  clientId: number;
  budgetMin?: number;
  budgetMax?: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  deadline?: string;
  requiredSkills?: string;
  location?: string;
  isRemote?: boolean;
  estimatedDuration?: string;
  assignedProfessionalId?: number;
  createdAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  categoryId: number;
  budgetMin?: number;
  budgetMax?: number;
  deadline?: string;
  requiredSkills?: string;
  location?: string;
  isRemote?: boolean;
  estimatedDuration?: string;
  assignedProfessionalId?: number;
}

// Proposal types (aligned with proposal-service)
export interface Proposal {
  id: number;
  taskId: number;
  taskTitle?: string;
  professionalId: number;
  professionalName?: string;
  message: string;
  proposedAmount?: number;
  estimatedDuration?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  updatedAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
}

export interface CreateProposalRequest {
  taskId: number;
  message: string;
  proposedAmount?: number;
  estimatedDuration?: string;
}

// Review types
export interface Review {
  id: number;
  taskId: number;
  reviewerId: number;
  reviewerName?: string;
  revieweeId: number;
  revieweeName?: string;
  rating: number;
  comment?: string;
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
  comment?: string;
}

// Chat types (aligned with chat-service DTOs)
export interface ChatThread {
  id: number;
  user1Id: number;
  user2Id: number;
  otherUserId?: number;
  taskId?: number;
  lastMessage?: string;
  lastMessageText?: string;
  lastMessageTime?: string;
  lastMessageSenderId?: number;
  unreadCount?: number;
  unreadCountUser1?: number;
  unreadCountUser2?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Message {
  id: number;
  threadId: number;
  senderId: number;
  content: string;
  messageType: string;
  isRead?: boolean;
  readAt?: string;
  createdAt?: string;
  sentAt?: string;
  isOwn?: boolean;
}

export interface SendMessageRequest {
  threadId: number;
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

export interface ProfessionalProfileRequest {
  primaryCategory?: string;
  skills?: string;
  hourlyRate?: number;
  location?: string;
  bio?: string;
  profilePictureUrl?: string;
}
