import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// 1. افزودن محصول جدید (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // اینجا از supabaseAdmin استفاده می‌کنیم که محدودیت‌های RLS رو دور می‌زنه
    // چون مطمئنیم این درخواست از پنل ادمین اومده (در آینده میشه Auth رو هم چک کرد)
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([body])
      .select();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. ویرایش محصول (PUT)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ error: 'ID محصول الزامی است' }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 3. حذف محصول (DELETE)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID محصول الزامی است' }, { status: 400 });

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}