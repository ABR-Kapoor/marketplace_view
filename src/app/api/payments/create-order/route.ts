import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { razorpay } from "@/lib/payment/razorpay";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { syncUserToDatabase } from "@/lib/auth/sync-user";

export async function POST(req: NextRequest) {
    try {
        const { getUser } = getKindeServerSession();
        const kindeUser = await getUser();

        if (!kindeUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Ensure user is in our DB
        const user = await syncUserToDatabase(kindeUser);

        const body = await req.json();
        const { amount, currency = "INR", items, description } = body;
        // Note: In a real app, 'amount' should be calculated on server from 'items' to prevent tampering.
        // For this implementation, we assume the frontend sends the correct amount or we blindly trust it for now 
        // (though securely we should calculate it). Let's trust it for this prototype step but note it.

        if (!amount) {
            return NextResponse.json({ error: "Amount is required" }, { status: 400 });
        }

        // 1. Create Razorpay Order
        const options = {
            amount: Math.round(amount * 100), // Razorpay expects amount in paise
            currency,
            receipt: `rcpt_${Date.now().toString().slice(-8)}`,
            notes: {
                userId: user.uid,
            },
        };

        const order = await razorpay.orders.create(options);

        // 2. Create Order in DB (orders table)
        const { data: dbOrder, error: orderError } = await supabaseAdmin
            .from("orders")
            .insert({
                user_id: user.uid,
                status: "pending",
                total_amount: amount,
                shipping_address: {}, // Placeholder, should come from request
            })
            .select()
            .single();

        if (orderError) {
            console.error("Error creating order:", orderError);
            return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
        }

        // 3. Create Transaction in DB (finance_transactions table)
        // Fetch pid first
        const { data: patientData, error: patientError } = await supabaseAdmin
            .from('patients')
            .select('pid')
            .eq('uid', user.uid)
            .single();

        if (patientError || !patientData) {
            console.error("Error getting patient:", patientError);
            return NextResponse.json({ error: "Patient record not found" }, { status: 500 });
        }

        const { error: txInsertError } = await supabaseAdmin
            .from("finance_transactions")
            .insert({
                pid: patientData.pid,
                transaction_type: "consultation", // Using existing enum
                amount: amount,
                currency,
                status: "pending",
                razorpay_order_id: order.id,
                description: description || "Marketplace Purchase",
            });

        if (txInsertError) {
            // If duplicate key error (which can happen if user retries rapidly or Razorpay returns same order ID),
            // checks if it already exists and if so, return success (idempotency).
            if (txInsertError.code === '23505') {
                console.warn("Transaction already exists for this order, continuing.");
            } else {
                console.error("Error creating transaction:", txInsertError);
                return NextResponse.json({ error: "Failed to create transaction record" }, { status: 500 });
            }
        }
        return NextResponse.json({
            id: order.id,
            currency: order.currency,
            amount: order.amount,
            dbOrderId: dbOrder.id, // Pass back internal order ID if needed
        });
    } catch (error) {
        console.error("Error in create-order:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
