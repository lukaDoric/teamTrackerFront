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
export interface RefreshStatus {
  state: 'idle' | 'running' | 'done' | 'failed';
  phase: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  error: string | null;
}

export interface PrAnalysis {
  number: number;
  title: string;
  state: string;
  authorLogin: string | null;
  createdAt: string;
  coverageBefore: number | null;
  coverageAfter: number | null;
  coverageDelta: number | null;
  improvedByReview: boolean;
  testsAddedAfterReview: boolean;
  contributingReviewers: string[];
}

export interface MaintainabilitySnapshot {
  nopMax: number;
  nopAvg: number;
  melocMax: number;
  melocAvg: number;
  violations: number;
}

export interface PrMaintainability {
  number: number;
  title: string;
  state: string;
  authorLogin: string | null;
  createdAt: string;
  before: MaintainabilitySnapshot | null;
  after: MaintainabilitySnapshot | null;
  violationsDelta: number | null;
  improvedByReview: boolean;
  contributingReviewers: string[];
}

export interface ReviewProblem {
  kind: string;
  file: string;
  method: string;
  meloc: number;
  nop: number;
  rules: string;
  detail: string | null;
  addressed: boolean;
  note: string | null;
}

export interface ReviewCommentAssessment {
  commentGitHubId: number;
  authorLogin: string | null;
  excerpt: string | null;
  onPoint: boolean;
  aspect: string | null;
  note: string | null;
}

export interface ReviewAssessment {
  number: number;
  sha: string;
  model: string | null;
  summary: string | null;
  createdAt: string;
  problemsTotal: number;
  addressed: number;
  missed: number;
  problems: ReviewProblem[];
  comments: ReviewCommentAssessment[];
}

export interface PrAnnotation {
  comment: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface PrOverviewRow {
  number: number;
  title: string;
  authorLogin: string | null;
  state: string;
  createdAt: string;
  commits: number;
  reviews: number;
  coverage: PrAnalysis | null;
  maintainability: PrMaintainability | null;
  annotation: PrAnnotation | null;
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
