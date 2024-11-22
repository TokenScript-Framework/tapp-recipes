import { TWITTER_ROOT } from '@/lib/constants'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'

export default function MembershipPage() {
  const members = [
    { id: 1, name: 'John Doe', username: 'johncom' },
    { id: 2, name: 'Jane Smith', username: 'jane.com' },
  ]

  return (
    <main className="flex-grow p-6 bg-white">
      <h1 className="text-2xl font-bold mb-4">Membership</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Username</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>{member.name}</TableCell>
              <TableCell><a className='hover:text-blue-500 hover:underline' href={`${TWITTER_ROOT}/${member.username}`} target="_blank">@{member.username}</a></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
  )
}