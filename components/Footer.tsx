import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-white mt-12 border-t">
      <div className="container py-6 text-center text-sm text-gray-600">
        © {new Date().getFullYear()} Vestti Marketplace — Demo
      </div>
    </footer>
  )
}
