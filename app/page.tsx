import Navbar from "@/components/HeroPage/Navbar"
import Hero from "@/components/HeroPage/Hero";
import Footer from "@/components/HeroPage/Footer";
// Server components using auth methods must be rendered dynamically
export const dynamic = 'force-dynamic';

export default async function Home() {

  return (
    <div className="relative overflow-hidden flex min-h-screen w-full flex-col">
      <Navbar />
      <Hero />
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
