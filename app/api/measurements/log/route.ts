/**
 * Body Measurements API Route
 * POST /api/measurements/log - Log body measurements
 * GET /api/measurements/log - Get all measurements
 */

import { NextResponse } from 'next/server';
import { BodyMeasurementsRepository } from '@/app/lib/repositories/body-measurements-repository';
import type { CreateBodyMeasurementsDTO } from '@/app/lib/types/health-dashboard';

export async function POST(request: Request) {
  try {
    const body: CreateBodyMeasurementsDTO = await request.json();

    if (!body.date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      );
    }

    const measurements = BodyMeasurementsRepository.create(body);

    return NextResponse.json(measurements, { status: 201 });
  } catch (error) {
    console.error('Error logging measurements:', error);
    return NextResponse.json(
      { error: 'Failed to log measurements' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const measurements = BodyMeasurementsRepository.getAll();
    const latest = BodyMeasurementsRepository.getLatest();

    return NextResponse.json({
      measurements,
      latest,
      totalEntries: measurements.length,
    });
  } catch (error) {
    console.error('Error fetching measurements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch measurements' },
      { status: 500 }
    );
  }
}
