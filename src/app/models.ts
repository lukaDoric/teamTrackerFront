export interface Paged<T> {
  page: number;
  pageSize: number;
  total: number;
  items: T[];
}

export interface Course {
  id: number;
  code: string;
  name: string;
  description: string | null;
  teams?: number;
}

export interface Team {
  id: number;
  name: string;
  courseId: number | null;
  repositories?: number;
}

export interface RepositoryListItem {
  id: number;
  fullName: string;
  teamId: number;
  lastSyncedAt: string | null;
  pullRequests: number;
}
export interface ReviewedPr {
  number: number;
  title: string;
  repoId: number;
  repoFullName: string;
  coverageImproved: boolean;
  maintainabilityImproved: boolean;
  instructorComment: string | null;
  instructorCommentIsPublic: boolean | null;
}

export interface LeaderboardEntry {
  login: string;
  prsReviewed: number;
  comments: number;
  coverageImprovements: number;
  maintainabilityImprovements: number;
  score: number;
  teams: string[];
  pullRequests: ReviewedPr[];
}

