export type RenewalStatus = 'urgent' | 'pending' | 'quoted' | 'progress';

export interface Renewal {
  id: string;
  clientName: string;
  policyType: string;
  policyId: string;
  daysUntilExpiry: number;
  status: RenewalStatus;
}

export type QuoteStage = 'pending' | 'submitted' | 'bound';

export interface Quote {
  id: string;
  clientName: string;
  policyType: string;
  estimatedPremium: string;
  stage: QuoteStage;
}

export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'overdue' | 'progress' | 'done';

export interface Task {
  id: string;
  name: string;
  dueDate: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  completed: boolean;
}

export type ActivityType = 'task' | 'renewal' | 'call' | 'quote' | 'document';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  date: string;
}

export type StatVariant = 'red' | 'amber' | 'blue' | 'green';

export interface StatCard {
  id: string;
  label: string;
  value: number;
  subtext: string;
  variant: StatVariant;
  badge?: string;
}
