'use client'

import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'

export default function ContentPage() {
  const [contents, setContents] = useState([
    { id: 1, title: 'Content 1' },
    { id: 2, title: 'Content 2' },
  ])
  const [newContent, setNewContent] = useState('')

  const handleCreate = () => {
    if (newContent) {
      setContents([...contents, { id: Date.now(), title: newContent }])
      setNewContent('')
    }
  }

  const handleEdit = (id: number, newTitle: string) => {
    setContents(contents.map(c => c.id === id ? { ...c, title: newTitle } : c))
  }

  const handleDelete = (id: number) => {
    setContents(contents.filter(c => c.id !== id))
  }

  return (
    <main className="flex-grow p-6 bg-white">
      <h1 className="text-2xl font-bold mb-4">Content</h1>
      <div className="flex mb-4">
        <Input
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="New content title"
          className="mr-2"
        />
        <Button onClick={handleCreate}>Create</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contents.map((content) => (
            <TableRow key={content.id}>
              <TableCell>{content.title}</TableCell>
              <TableCell>
                <Button onClick={() => handleEdit(content.id, prompt('New title') || content.title)} className="mr-2">Edit</Button>
                <Button onClick={() => handleDelete(content.id)} variant="destructive">Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
  )
}