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
        const { shipping_address } = body; // Address from frontend

        // 1. Fetch Cart
        const { data: cart, error: cartError } = await supabaseAdmin
            .from('carts')
            .select('*, items:cart_items(*, medicine:medicines(*))')
            .eq('user_id', user.uid)
            .single();

        if (cartError || !cart || !cart.items || cart.items.length === 0) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
        }

        // 2. Calculate Total Amount
        let totalAmount = 0;
        const orderItems = [];

        for (const item of cart.items) {
            const price = item.medicine.price;
            totalAmount += price * item.quantity;
            orderItems.push({
                medicine_id: item.medicine.id,
                quantity: item.quantity,
                price_at_purchase: price
            });
        }

        if (totalAmount <= 0) {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }

        // 3. Create Razorpay Order
        const options = {
            amount: Math.round(totalAmount * 100), // Razorpay expects amount in paise
            currency: "INR",
            receipt: `rcpt_${Date.now().toString().slice(-8)}`,
            notes: {
                userId: user.uid,
            },
        };

        const razorpayOrder = await razorpay.orders.create(options);

        // 4. Create Order in DB (orders table)
        const { data: dbOrder, error: orderError } = await supabaseAdmin
            .from("orders")
            .insert({
                user_id: user.uid,
                status: "pending", // Initially pending, updated to PENDING_DELIVERY after payment
                total_amount: totalAmount,
                shipping_address: shipping_address || {},
                customer_name: user.name,
                customer_phone: user.phone
            })
            .select()
            .single();

        if (orderError) {
            console.error("Error creating order:", orderError);
            return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
        }

        // 5. Create Order Items
        const itemsToInsert = orderItems.map(item => ({
            order_id: dbOrder.id,
            ...item
        }));

        const { error: itemsError } = await supabaseAdmin
            .from("order_items")
            .insert(itemsToInsert);

        if (itemsError) {
            console.error("Error creating order items:", itemsError);
            // Consider rolling back order? Or return error.
            return NextResponse.json({ error: "Failed to create order items" }, { status: 500 });
        }

        // 6. Create Transaction in DB (finance_transactions table)
        // Fetch pid first
        const { data: patientData, error: patientError } = await supabaseAdmin
            .from('patients')
            .select('pid')
            .eq('uid', user.uid)
            .single();

        if (patientError || !patientData) {
            console.error("Error getting patient:", patientError);
            // This is critical if we need finance transactions
            // But maybe we can proceed without it for now or create a dummy transaction?
            // Let's assume patient exists because syncUserToDatabase handles user creation, 
            // but syncUserToDatabase might not create 'patients' record unless the trigger fired.
            // The trigger 'auto_insert_user_role' handles it.
            return NextResponse.json({ error: "Patient record not found" }, { status: 500 });
        }

        const { error: txInsertError } = await supabaseAdmin
            .from("finance_transactions")
            .insert({
                pid: patientData.pid,
                transaction_type: "consultation", // Or better "purchase" if enum supports it?
                amount: totalAmount,
                currency: "INR",
                status: "pending",
                razorpay_order_id: razorpayOrder.id,
                description: `Marketplace Order #${dbOrder.order_number || dbOrder.id}`,
            });

        if (txInsertError) {
            if (txInsertError.code === '23505') {
                console.warn("Transaction already exists for this order, continuing.");
            } else {
                console.error("Error creating transaction:", txInsertError);
                // Non-blocking for order flow, but logged
            }
        }

        return NextResponse.json({
            id: razorpayOrder.id,
            currency: razorpayOrder.currency,
            amount: razorpayOrder.amount,
            dbOrderId: dbOrder.id, // Pass back internal order ID
        });

    } catch (error: any) {
        console.error("Error in create-order:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
