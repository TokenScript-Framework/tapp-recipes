import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { MainSection } from '@/components/main-section';

export default function Page() {
  return (
    <div className='flex flex-col min-h-screen bg-white text-gray-900'>
      <Header />

      <main className='flex-grow'>
        <MainSection />
      </main>
      <Footer />
    </div>
  );
}
