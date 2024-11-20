import { EnsSales } from '@/components/ens-sales'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'

export default function Page() {
  // return <EnsSales />
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      <Header />

      <EnsSales />
      <Footer />
    </div>
  )
}
