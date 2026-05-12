export type ApplicationStatus =
  | 'wishlist'
  | 'applied'
  | 'interview'
  | 'offer'
  | 'rejected'

export type JobApplication = {
  id: string
  user_id: string
  company_name: string
  job_title: string
  job_url: string | null
  location: string | null
  status: ApplicationStatus
  applied_date: string | null
  deadline: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type CreateApplicationInput = {
  company_name: string
  job_title: string
  job_url?: string
  location?: string
  status?: ApplicationStatus
  applied_date?: string
  deadline?: string
  notes?: string
}

export type UpdateApplicationInput = Partial<CreateApplicationInput>
