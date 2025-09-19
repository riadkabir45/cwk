export interface Tag {
  id: string;
  name: string;
  description?: string;
  color: string;
  approved: boolean;
  creator: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  createdAt: string;
  approvedAt?: string;
  approvedBy?: {
    id: string;
    email: string;
  };
  usageCount: number;
}

export interface TagSuggestion {
  id: string;
  suggestedName: string;
  description?: string;
  reason: string;
  suggestedBy: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  createdAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: {
    id: string;
    email: string;
  };
  reviewedAt?: string;
  moderatorComments?: string;
  createdTag?: Tag;
}

export interface TaskTagSuggestion {
  id: string;
  task: {
    id: string;
    taskName: string;
  };
  suggestedTag: Tag;
  suggestedBy: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  reason: string;
  createdAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: {
    id: string;
    email: string;
  };
  reviewedAt?: string;
  moderatorComments?: string;
}

export interface CreateTagRequest {
  name: string;
  description?: string;
  color?: string;
}

export interface SuggestTagRequest {
  name: string;
  description?: string;
  reason: string;
}

export interface SuggestTaskTagRequest {
  tagId: string;
  taskId: string;
  reason: string;
}