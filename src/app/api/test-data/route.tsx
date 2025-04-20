import { sampleProjects, sampleTasks, sampleConversations, sampleNotes } from '@/app/api/test-data';

export async function GET(): Promise<Response> {
  return new Response(JSON.stringify({ message: 'Test data API endpoint' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request: Request): Promise<Response> {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return new Response(JSON.stringify({ success: false, message: 'User ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // This would be implemented to actually load test data
    // For now, just return success message
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Test data API endpoint ready for implementation',
      sampleCounts: {
        projects: sampleProjects.length,
        tasks: sampleTasks.length,
        conversations: sampleConversations.length,
        notes: sampleNotes.length
      }
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: 'Failed to process request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
