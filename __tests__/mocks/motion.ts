import React from 'react'

interface MotionComponentProps {
  children?: React.ReactNode
  [key: string]: unknown
}

export const mockMotion = {
  div: (props: MotionComponentProps) => props.children,
  button: (props: MotionComponentProps) => props.children,
  span: (props: MotionComponentProps) => props.children,
  form: (props: MotionComponentProps) => props.children,
  p: (props: MotionComponentProps) => props.children,
}

export const mockAnimatePresence = (props: MotionComponentProps) => props.children
