export interface UserType {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
}

export interface NavbarProps {
    user?: UserType;
    projectName: string;
    onLogout?: () => void;
    onProfileClick?: () => void;
    onSettingsClick?: () => void;
}

export interface FooterLink {
    name: string;
    href: string;
    icon?: React.ComponentType<{ className?: string }>;
}

export interface SocialLink {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
}

export interface FooterSection {
    title: string;
    links: FooterLink[];
}

export interface FooterProps {
    companyName?: string;
    description?: string;
    sections?: FooterSection[];
    socialLinks?: SocialLink[];
    showNewsletter?: boolean;
    copyrightText?: string;
}

// Types
export type Page = 'home' | 'explore' | 'profile' | 'detail' | 'messages' | 'notifications';

// export interface Post {
//     id: number;
//     author: {
//         name: string;
//         username: string;
//         avatar: string;
//     };
//     content: string;
//     image?: string;
//     likes: number;
//     comments: number;
//     shares: number;
//     timestamp: string;
// }


//  export interface Community {
//   _id: string;
//   name: string;
//   description: string;
//   tags: string[];
//   members: any[];
//   online: number;
//   bannerColor: string;
//    category?: string;
//   isJoined: boolean;
// }


export interface User {
    _id: string;
    name: string;
    username: string;
    email: string;
    avatar?: string;
      bannerColor?: string;
    role?: string;
    isMember: boolean;
    joinDate:string;
}

export type PrivacyType = 'public' | 'friends' | 'private';



// For Community
export type CommunityPrivacy = "public" | "private" | "restricted";
export type CommunityRole = "admin" | "member" | "moderator";

export interface CommunityMember {
    user: string | User;  // populated or just ObjectId
    role: CommunityRole;
    joinedAt: string;     // ISO date string
}

export interface Community {
    _id?: string;               // MongoDB ObjectId as string
    name: string;
    description: string;
    category: string;
    privacy: CommunityPrivacy;
    tags: string[];
    rules: string[];
    bannerColor: string;
    allowImage: boolean;
    allowCode: boolean;
    allowPoll: boolean;
    allowLink: boolean;
    allowAchievement: boolean;
    requireApproval: boolean;
    createdBy?: string | User;    // populated or just ID
    members?: CommunityMember[];
    isJoined?: boolean;
    createdAt?: string;
    updatedAt?: string;
    online?: number;

}

export type ModalType = 'join' | 'leave';


export interface Post {
    id: string;
    author: User;
    content: string;
     image?: string;
    timestamp: string;
    likes: number;
    comments: number;
    shares: number;
    isLiked: boolean;
    media?: string;
    type: 'text' | 'code' | 'question' | 'achievement' | 'poll';
    status: 'published' | 'pending' | 'rejected';
    code?: {
        language: string;
        code: string;
    };
    poll?: {
        question: string;
        options: { text: string; votes: number; percentage: number }[];
        totalVotes: number;
        userVoted?: boolean;
    };
    achievement?: {
        title: string;
        description: string;
        tags: string[];
    };
       privacy: PrivacyType;
    location?: string;
    taggedUsers: User[];
}