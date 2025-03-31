import BookingDetailClient from './client';

// Define params as a Promise type
type Params = Promise<{ booking_id: string }>;

// This is a server component that handles async params
export default async function BookingDetailPage({ 
  params 
}: { 
  params: Params
}) {
  // Await the params
  const resolvedParams = await params;
  return <BookingDetailClient booking_id={resolvedParams.booking_id} />;
} 