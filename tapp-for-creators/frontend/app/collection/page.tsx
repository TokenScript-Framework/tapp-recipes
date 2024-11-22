'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function CollectionPage() {
  const [collections, setCollections] = useState([
    { id: 1, name: 'Collection 1' },
    { id: 2, name: 'Collection 2' },
  ])
  const [newCollection, setNewCollection] = useState('')

  const handleCreate = () => {
    if (newCollection) {
      setCollections([...collections, { id: Date.now(), name: newCollection }])
      setNewCollection('')
    }
  }

  const handleEdit = (id: number, newName: string) => {
    setCollections(collections.map(c => c.id === id ? { ...c, name: newName } : c))
  }

  const handleDelete = (id: number) => {
    setCollections(collections.filter(c => c.id !== id))
  }

  return (
    <main className="flex-grow p-6 bg-white">
      <h1 className="text-2xl font-bold mb-4">Collections</h1>
      <div className="flex mb-4">
        <Input
          value={newCollection}
          onChange={(e) => setNewCollection(e.target.value)}
          placeholder="New collection name"
          className="mr-2"
        />
        <Button onClick={handleCreate}>Create</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {collections.map((collection) => (
            <TableRow key={collection.id}>
              <TableCell>{collection.name}</TableCell>
              <TableCell>
                <Button onClick={() => handleEdit(collection.id, prompt('New name') || collection.name)} className="mr-2">Edit</Button>
                <Button onClick={() => handleDelete(collection.id)} variant="destructive">Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
  )
}