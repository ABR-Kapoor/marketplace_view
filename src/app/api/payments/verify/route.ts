import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import sql from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = body;

        console.log("Verifying payment for Order ID:", order_id);

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
        }

        const bodyStr = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(bodyStr.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        const [txData] = await sql`
            UPDATE finance_transactions SET 
                status = 'paid', 
                paid_at = ${new Date().toISOString()}, 
                razorpay_payment_id = ${razorpay_payment_id}, 
                razorpay_signature = ${razorpay_signature}, 
                payment_method = 'razorpay'
            WHERE razorpay_order_id = ${razorpay_order_id}
            RETURNING *
        `;

        if (!txData) {
            console.error("Warning: Transaction not found to update.");
        }

        const [orderData] = await sql`
            UPDATE orders SET 
                status = 'PENDING_DELIVERY', 
                updated_at = ${new Date().toISOString()}
            WHERE id = ${order_id}
            RETURNING *
        `;

        if (!orderData) {
            return NextResponse.json({ error: "Order not found" }, { status: 500 });
        }

        const [cartData] = await sql`SELECT id FROM carts WHERE user_id = ${orderData.user_id}`;

        if (cartData) {
            await sql`DELETE FROM cart_items WHERE cart_id = ${cartData.id}`;
            console.log("Cart cleared for user:", orderData.user_id);
        }

        if (txData) {
            try {
                await sql`
                    INSERT INTO receipts (
                        transaction_id, pid, did, patient_name, doctor_name, 
                        consultation_fee, total_amount, payment_method, razorpay_payment_id
                    ) VALUES (
                        ${txData.transaction_id}, ${txData.pid}, ${txData.did || txData.pid}, 
                        'Patient', 'AuraMart Marketplace', ${txData.amount}, ${txData.amount}, 
                        'razorpay', ${razorpay_payment_id}
                    )
                `;
            } catch (receiptError) {
                console.error("Error creating receipt:", receiptError);
            }
        }

        return NextResponse.json({ success: true, message: "Payment verified and order confirmed" });
    } catch (error: any) {
        console.error("Error in verification:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
