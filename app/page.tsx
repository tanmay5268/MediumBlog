
// Server components using auth methods must be rendered dynamically
export const dynamic = 'force-dynamic';

export default async function Home() {

  return (
    <div className="flex flex-col gap-2 min-h-screen items-center justify-center bg-gray-900">
     Hello
    </div>
  );
}