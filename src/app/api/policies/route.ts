import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/store';
import { securityEngine } from '@/lib/security/engine';
import { GuardrailPolicy } from '@/lib/types';

export async function GET() {
  try {
    const policies = dataStore.getPolicies();
    return NextResponse.json({
      policies,
      total: policies.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch policies' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: GuardrailPolicy = await req.json();

    if (!body.name || !body.action) {
      return NextResponse.json({ error: 'Fields "name" and "action" are required.' }, { status: 400 });
    }

    const newPolicy: GuardrailPolicy = {
      id: body.id || `pol-custom-${Date.now().toString().slice(-4)}`,
      name: body.name,
      description: body.description || '',
      category: body.category || 'injection',
      riskLevel: body.riskLevel || 'MEDIUM',
      action: body.action || 'BLOCK',
      enabled: body.enabled !== undefined ? body.enabled : true,
    };

    dataStore.createPolicy(newPolicy);
    securityEngine.addPolicy(newPolicy);

    return NextResponse.json(newPolicy, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create policy' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Field "id" is required for policy update.' }, { status: 400 });
    }

    const updated = dataStore.updatePolicy(id, updates);
    securityEngine.updatePolicy(id, updates);

    if (!updated) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update policy' }, { status: 500 });
  }
}
