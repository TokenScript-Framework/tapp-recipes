'use client'

import * as React from 'react'

export default function Dashboard() {
  return (
    <>
      <main className="flex-grow p-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-blue-700">Content Area 1</h2>
              <p>This is the first content area of your dashboard. You can add any relevant information or components here.</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-blue-700">Content Area 2</h2>
              <p>This is the second content area of your dashboard. You can add charts, tables, or any other data visualization here.</p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}