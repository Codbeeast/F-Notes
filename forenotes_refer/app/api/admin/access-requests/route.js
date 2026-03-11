// app/api/admin/access-requests/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import ReferralAccessRequest from '@/models/ReferralAccessRequest';
import User from '@/models/User';
import { nanoid } from 'nanoid';

export const runtime = 'nodejs';

// GET: List all referral access requests
export async function GET() {
    try {
        const adminCheck = await requireAdmin();
        if (!adminCheck.isAdmin) {
            return NextResponse.json(
                { error: adminCheck.error.message },
                { status: adminCheck.error.status }
            );
        }

        await connectDB();

        const requests = await ReferralAccessRequest.find({})
            .sort({ requestedAt: -1 })
            .lean();

        // Enrich with user info
        const { clerkClient } = await import('@clerk/nextjs/server');
        const client = await clerkClient();

        const enriched = await Promise.all(
            requests.map(async (req) => {
                // If the request object itself has the cached details, use them.
                let userFromReq = req.name && req.name !== 'Unknown'
                    ? { name: req.name, email: req.email || '', imageUrl: req.imageUrl || '' }
                    : null;

                let user = null;
                if (!userFromReq) {
                    user = await User.findById(req.clerkUserId)
                        .select('firstName lastName email imageUrl')
                        .lean();

                    // If user is missing in MongoDB (e.g. orphaned or ID mismatch), fetch from Clerk API directly
                    if (!user) {
                        try {
                            const clerkUser = await client.users.getUser(req.clerkUserId);
                            if (clerkUser) {
                                user = {
                                    firstName: clerkUser.firstName || '',
                                    lastName: clerkUser.lastName || '',
                                    email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
                                    imageUrl: clerkUser.imageUrl || '',
                                };
                            }
                        } catch (clerkErr) {
                            console.warn(`Could not find user ${req.clerkUserId} in MongoDB or Clerk.`);
                        }
                    }
                }

                let finalUser = userFromReq;
                if (!finalUser && user) {
                    finalUser = {
                        name: `${user.firstName || 'Unknown'} ${user.lastName || ''}`.trim(),
                        email: user.email || '',
                        imageUrl: user.imageUrl || '',
                    };
                }

                return {
                    _id: req._id,
                    clerkUserId: req.clerkUserId,
                    status: req.status,
                    requestedAt: req.requestedAt,
                    reviewedAt: req.reviewedAt,
                    reviewedBy: req.reviewedBy,
                    user: finalUser || { name: 'Unknown User (Deleted)', email: 'N/A', imageUrl: '' },
                };
            })
        );

        return NextResponse.json({ requests: enriched });
    } catch (error) {
        console.error('GET /api/admin/access-requests error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH: Approve or reject an access request
export async function PATCH(req) {
    try {
        const adminCheck = await requireAdmin();
        if (!adminCheck.isAdmin) {
            return NextResponse.json(
                { error: adminCheck.error.message },
                { status: adminCheck.error.status }
            );
        }

        const body = await req.json();
        const { requestId, action } = body; // action: 'APPROVED' | 'REJECTED'

        if (!requestId || !['APPROVED', 'REJECTED'].includes(action)) {
            return NextResponse.json(
                { error: 'requestId and action (APPROVED/REJECTED) are required' },
                { status: 400 }
            );
        }

        await connectDB();

        const request = await ReferralAccessRequest.findById(requestId);
        if (!request) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        if (request.status !== 'REQUESTED') {
            return NextResponse.json(
                { error: `Request already ${request.status.toLowerCase()}` },
                { status: 400 }
            );
        }

        // Update request
        request.status = action;
        request.reviewedAt = new Date();
        request.reviewedBy = adminCheck.userId;
        await request.save();

        // If approved, enable referral and generate code if needed
        if (action === 'APPROVED') {
            // Use the code from the request, or generate one if the request doesn't have a code
            let referralCode = request.referralCode;
            if (!referralCode) {
                let code;
                let exists = true;
                while (exists) {
                    code = nanoid(8);
                    exists = await User.findOne({ referralCode: code }).lean();
                }
                referralCode = code;
            }
            
            // Use findByIdAndUpdate to ensure we update even if user doesn't exist
            const updatedUser = await User.findByIdAndUpdate(
                request.clerkUserId,
                {
                    $set: {
                        referralCode,
                        referralEnabled: true
                    }
                },
                { new: true }
            );
            
            if (!updatedUser) {
                console.warn(`⚠️ User ${request.clerkUserId} not found when approving request ${requestId}`);
            } else {
                console.log(`✅ User ${request.clerkUserId} approved with code: ${referralCode}`);
            }
        }

        console.log(`📋 Access request ${requestId} ${action} by ${adminCheck.userId}`);

        return NextResponse.json({
            success: true,
            message: `Request ${action.toLowerCase()} successfully`,
        });
    } catch (error) {
        console.error('PATCH /api/admin/access-requests error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
