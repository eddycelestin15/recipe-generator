/**
 * Progress Photos API Route
 * POST /api/progress-photos/upload - Upload a progress photo
 * GET /api/progress-photos/upload - Get all progress photos
 */

import { NextResponse } from 'next/server';
import { ProgressPhotoRepository } from '@/app/lib/repositories/progress-photo-repository';
import type { CreateProgressPhotoDTO } from '@/app/lib/types/health-dashboard';

export async function POST(request: Request) {
  try {
    const body: CreateProgressPhotoDTO = await request.json();

    if (!body.date || !body.imageUrl || !body.angle) {
      return NextResponse.json(
        { error: 'Date, imageUrl, and angle are required' },
        { status: 400 }
      );
    }

    const photo = ProgressPhotoRepository.create(body);

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error('Error uploading progress photo:', error);
    return NextResponse.json(
      { error: 'Failed to upload progress photo' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const photos = ProgressPhotoRepository.getAll();
    const latestByAngle = ProgressPhotoRepository.getLatestByAngle();
    const beforeAfter = ProgressPhotoRepository.getBeforeAfter();
    const timeline = ProgressPhotoRepository.getTimeline(6);

    return NextResponse.json({
      photos,
      latestByAngle,
      beforeAfter,
      timeline,
      totalPhotos: photos.length,
    });
  } catch (error) {
    console.error('Error fetching progress photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress photos' },
      { status: 500 }
    );
  }
}
