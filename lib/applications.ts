import { supabase } from './supabase'
import type {
  CreateApplicationInput,
  UpdateApplicationInput,
} from './application-types'

async function getCurrentUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw new Error(error.message)
  }

  if (!user) {
    throw new Error('User must be logged in')
  }

  return user.id
}

export async function getApplications() {
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function getApplicationById(id: string) {
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function createApplication(input: CreateApplicationInput) {
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from('applications')
    .insert({
      ...input,
      user_id: userId,
      status: input.status ?? 'wishlist',
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function updateApplication(
  id: string,
  input: UpdateApplicationInput
) {
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from('applications')
    .update(input)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function deleteApplication(id: string) {
  const userId = await getCurrentUserId()

  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    throw new Error(error.message)
  }

  return true
}
