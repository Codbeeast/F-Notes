import { connectDB } from '@/lib/db';
import Session from '@/models/Session';
import { auth } from '@clerk/nextjs/server';

export async function GET(_, { params }) {
  try {
    await connectDB();
    const { userId } = auth();
    const { id } = params;

    if (!userId) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    const session = await Session.findOne({ _id: id, userId }).populate('strategies');

    if (!session) {
      return new Response(JSON.stringify({ message: 'Session not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(session), { status: 200 });
  } catch (err) {
    console.error('GET /api/sessions/[id] error:', err);
    return new Response(JSON.stringify({ message: 'Error fetching session' }), { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { userId } = auth();
    const updates = await req.json();
    const { id } = params;

    if (!userId) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    if (!id) {
      return new Response(JSON.stringify({ message: 'Missing ID' }), { status: 400 });
    }

    delete updates._id;
    delete updates.__v;

    const updatedSession = await Session.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true }
    ).populate('strategies');

    if (!updatedSession) {
      return new Response(JSON.stringify({ message: 'Session not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(updatedSession), { status: 200 });
  } catch (err) {
    console.error('PUT /api/sessions/[id] error:', err);
    return new Response(JSON.stringify({ message: 'Error updating session' }), { status: 500 });
  }
}

export async function DELETE(_, { params }) {
  try {
    await connectDB();
    const { userId } = auth();
    const { id } = params;

    if (!userId) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    if (!id) {
      return new Response(JSON.stringify({ message: 'Missing ID' }), { status: 400 });
    }

    const deleted = await Session.findOneAndDelete({ _id: id, userId });

    if (!deleted) {
      return new Response(JSON.stringify({ message: 'Session not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: 'Session deleted' }), { status: 200 });
  } catch (err) {
    console.error('DELETE /api/sessions/[id] error:', err);
    return new Response(JSON.stringify({ message: 'Error deleting session' }), { status: 500 });
  }
}
