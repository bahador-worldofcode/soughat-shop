import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const { orderId, rating, comment } = await request.json();

    if (!orderId || !comment) {
      return NextResponse.json({ error: 'شماره سفارش و متن نظر الزامی است.' }, { status: 400 });
    }

    // بررسی وجود سفارش
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, sender_name, items')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'سفارش با این شماره یافت نشد.' }, { status: 404 });
    }

    // بررسی اینکه قبلا نظری برای این سفارش ثبت نشده باشد
    const { data: existingReview } = await supabaseAdmin
      .from('reviews')
      .select('id')
      .eq('order_id', orderId)
      .single();

    if (existingReview) {
      return NextResponse.json({ error: 'برای این سفارش قبلاً نظری ثبت شده است.' }, { status: 400 });
    }

    // استخراج نام اقلام سفارش
    const itemsSummary = order.items.map((item: any) => item.title).join('، ');

    // ثبت نظر
    const { error: insertError } = await supabaseAdmin
      .from('reviews')
      .insert([{
        order_id: order.id,
        sender_name: order.sender_name || 'مشتری',
        items_summary: itemsSummary,
        rating: Number(rating) || 5,
        comment: comment,
        is_approved: false // نیاز به تایید شما دارد
      }]);

    if (insertError) throw insertError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}