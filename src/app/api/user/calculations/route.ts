import { NextResponse } from 'next/server';

// Mock DB for user calculations & points
const mockDB = new Map();

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { userId, calculatorSlug, inputParams, outputResults } = data;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Save calculation history
    const history = mockDB.get(`history_${userId}`) || [];
    history.push({
      calculatorSlug,
      inputParams,
      outputResults,
      timestamp: new Date().toISOString()
    });
    mockDB.set(`history_${userId}`, history);

    // Trigger Gamification: awardPoints (+15 Bloom Points)
    const points = mockDB.get(`points_${userId}`) || 0;
    const newPoints = points + 15;
    mockDB.set(`points_${userId}`, newPoints);

    return NextResponse.json({ 
      success: true, 
      message: 'Calculation saved and 15 Bloom Points awarded!',
      totalPoints: newPoints 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
