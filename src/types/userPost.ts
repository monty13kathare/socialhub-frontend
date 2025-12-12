export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Comment {
  _id: string;
  content: string;
  author: User;
  createdAt: string;
  updatedAt: string;
}

export interface UserPost {
  _id: string;
  content: string;
  type: 'text' | 'code' | 'question' | 'achievement' | 'poll';
  author: User;
  tags: string[];
  image?: {
    public_id: string;
    url: string;
  };
  code?: {
    language: string;
    code: string;
  };
  poll?: {
    question: string;
    options: Array<{
      text: string;
    }>;
    totalVotes: number;
  };
  achievement?: {
    title: string;
    description: string;
  };
  privacy: 'public' | 'private' | 'friends';
  taggedUsers: User[];
  location?: string;
  likes: string[];
  comments: any[];
  shares: any[];
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  commentsCount: number;
}