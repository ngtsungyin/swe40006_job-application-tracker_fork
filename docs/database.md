# Database Schema

## Table: applications

This table stores job applications for each logged-in user.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| id | uuid | yes | Primary key, generated automatically |
| user_id | uuid | yes | References Supabase auth.users |
| company_name | text | yes | Company name |
| job_title | text | yes | Job position/title |
| job_url | text | no | Link to job post |
| location | text | no | Job location |
| status | text | yes | wishlist, applied, interview, offer, rejected |
| applied_date | date | no | Date the user applied |
| deadline | date | no | Application deadline |
| notes | text | no | Extra notes |
| created_at | timestamp | yes | Created automatically |
| updated_at | timestamp | yes | Updated automatically by trigger |

## Allowed Status Values

The `status` column only allows:

- wishlist
- applied
- interview
- offer
- rejected

## Row Level Security

Row Level Security is enabled on the `applications` table.

Policies:

- Users can view only their own applications.
- Users can insert only their own applications.
- Users can update only their own applications.
- Users can delete only their own applications.

The policies use `auth.uid()` to compare the logged-in user with the `user_id` column.

## CRUD Functions

The CRUD helper functions are in:

```txt
lib/applications.ts
