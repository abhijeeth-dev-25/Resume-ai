import React from 'react'
import { RouterProvider } from 'react-router'
import { router } from './app.routers'
import { AuthProvider } from './context/AuthContext'

const App = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
