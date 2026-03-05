import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { razorpay } from "@/lib/payment/razorpay";
import { syncUserToDatabase } from "@/lib/auth/sync-user";
import sql from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const { getUser } = getKindeServerSession();
        const kindeUser = await getUser();

        if (!kindeUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const user = await syncUserToDatabase(kindeUser as any);

        const body = await req.json();
        const { shipping_address } = body;

        const [cart] = await sql`SELECT id FROM carts WHERE user_id = ${user.uid}`;
        if (!cart) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

        const cartItems = await sql`
            SELECT ci.id, ci.quantity, ci.medicine_id, m.price 
            FROM cart_items ci JOIN medicines m ON ci.medicine_id = m.id WHERE ci.cart_id = ${cart.id}
        `;

        if (!cartItems || cartItems.length === 0) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
        }

        let totalAmount = 0;
        const orderItems = [];

        for (const item of cartItems) {
            totalAmount += item.price * item.quantity;
            orderItems.push({
                medicine_id: item.medicine_id,
                quantity: item.quantity,
                price_at_purchase: item.price
            });
        }

        if (totalAmount <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

        const options = {
            amount: Math.round(totalAmount * 100),
            currency: "INR",
            receipt: `rcpt_${Date.now().toString().slice(-8)}`,
            notes: { userId: user.uid },
        };

        const razorpayOrder = await razorpay.orders.create(options);

        // 4. Create Order in DB (orders table)
        const [dbOrder] = await sql`
            INSERT INTO orders (user_id, status, total_amount, shipping_address, customer_name, customer_phone)
            VALUES (${user.uid}, 'pending', ${totalAmount}, ${shipping_address || {}}, ${user.name}, ${user.phone})
            RETURNING *
        `;

        if (!dbOrder) {
            return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
        }

        // 5. Create Order Items
        for (const item of orderItems) {
            await sql`
                INSERT INTO order_items (order_id, medicine_id, quantity, price_at_purchase)
                VALUES (${dbOrder.id}, ${item.medicine_id}, ${item.quantity}, ${item.price_at_purchase})
            `;
        }

        // 6. Create Transaction in DB
        const [patientData] = await sql`SELECT pid FROM patients WHERE uid = ${user.uid}`;

        if (!patientData) {
            return NextResponse.json({ error: "Patient record not found" }, { status: 500 });
        }

        try {
            await sql`
                INSERT INTO finance_transactions (
                    pid, transaction_type, amount, currency, status, 
                    razorpay_order_id, description
                ) VALUES (
                    ${patientData.pid}, 'consultation', ${totalAmount}, 'INR', 'pending', 
                    ${razorpayOrder.id}, ${`Marketplace Order #${dbOrder.order_number || dbOrder.id}`}
                )
            `;
        } catch (txInsertError: any) {
            if (txInsertError.code === '23505') {
                console.warn("Transaction already exists for this order, continuing.");
            } else {
                console.error("Error creating transaction:", txInsertError);
            }
        }

        return NextResponse.json({
            id: razorpayOrder.id,
            currency: razorpayOrder.currency,
            amount: razorpayOrder.amount,
            dbOrderId: dbOrder.id,
        });

    } catch (error: any) {
        console.error("Error in create-order:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
