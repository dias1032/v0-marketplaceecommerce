import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string
}

export default function Button({ label, children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={"px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 " + (props.className ?? '')}
    >
      {label ?? children}
    </button>
  )
}
