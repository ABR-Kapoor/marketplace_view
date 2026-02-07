import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = body;

        console.log("Verifying payment for Order ID:", order_id);

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
        }

        // 1. Verify Signature
        const bodyStr = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(bodyStr.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        // 2. Update Finance Transaction (Mark as paid)
        const { data: txData, error: txError } = await supabaseAdmin
            .from("finance_transactions")
            .update({
                status: "paid",
                paid_at: new Date().toISOString(),
                razorpay_payment_id,
                razorpay_signature,
                payment_method: "razorpay"
            })
            .eq("razorpay_order_id", razorpay_order_id)
            .select()
            .single();

        if (txError) {
            console.error("Error updating transaction:", txError);
            return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
        }

        // 3. Update Order Status to PENDING_DELIVERY and set paid
        const { data: orderData, error: orderError } = await supabaseAdmin
            .from("orders")
            .update({
                status: "PENDING_DELIVERY", // Crucial for Admin visibility
                updated_at: new Date().toISOString()
                // We could store payment info here too if schema supported it
            })
            .eq("id", order_id)
            .select()
            .single();

        if (orderError) {
            console.error("Error updating order status:", orderError);
            return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
        }

        // 4. Clear User's Cart
        if (orderData && orderData.user_id) {
            const { data: cartData } = await supabaseAdmin
                .from('carts')
                .select('id')
                .eq('user_id', orderData.user_id)
                .single();

            if (cartData) {
                const { error: clearCartError } = await supabaseAdmin
                    .from('cart_items')
                    .delete()
                    .eq('cart_id', cartData.id);

                if (clearCartError) {
                    console.error("Error clearing cart:", clearCartError);
                } else {
                    console.log("Cart cleared for user:", orderData.user_id);
                }
            }
        }

        // 5. Generate Receipt
        // Fallback for PID/DID if transaction doesn't have them populated correctly or needing lookup
        // But txData has PID.
        if (txData) {
            const { error: receiptError } = await supabaseAdmin
                .from("receipts")
                .insert({
                    transaction_id: txData.transaction_id,
                    pid: txData.pid,
                    did: txData.did || txData.pid, // Fallback
                    patient_name: "Patient", // Should fetch name ideally
                    doctor_name: "AuraMart Marketplace",
                    consultation_fee: txData.amount, // Using amount as fee for now
                    total_amount: txData.amount,
                    payment_method: "razorpay",
                    razorpay_payment_id: razorpay_payment_id
                });

            if (receiptError) {
                console.error("Error creating receipt:", receiptError);
            }
        }

        return NextResponse.json({ success: true, message: "Payment verified and order confirmed" });
    } catch (error: any) {
        console.error("Error in verification:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
