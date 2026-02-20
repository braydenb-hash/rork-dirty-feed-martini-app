export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  city: string;
  totalMartinis: number;
  averageRating: number;
  barsVisited: number;
  badges: Badge[];
  joinedDate: string;
}

export interface MartiniLog {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  barId: string;
  barName: string;
  city: string;
  rating: number;
  photo: string;
  notes: string;
  style: string;
  timestamp: string;
  likes: number;
  liked: boolean;
  comments?: Comment[];
}

export interface Bar {
  id: string;
  name: string;
  city: string;
  address: string;
  photo: string;
  communityRating: number;
  totalReviews: number;
  topDrink: string;
  latitude: number;
  longitude: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  requirement: string;
  progress?: number;
  progressMax?: number;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
}

export type LeaderboardType = 'most_poured' | 'city_connoisseur' | 'bar_hopper';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userAvatar: string;
  value: number;
  label: string;
}
