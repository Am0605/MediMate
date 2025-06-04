export type UserInfo = {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  unreadNotifications: number;
};

export type HealthNewsItem = {
  id: string;
  title: string;
  summary: string;
  content?: string;
  image: any; // For require() images
  date: string;
  category: string;
  author?: string;
};