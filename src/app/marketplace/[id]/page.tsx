import { createClient } from '@/utils/supabase/server'
import { AddToCartButton } from '@/components/AddToCartButton'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Package, ShieldCheck, Truck } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function MedicineDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    const supabase = await createClient()

    const { data: medicine } = await supabase
        .from('medicines')
        .select('*')
        .eq('id', params.id)
        .single()

    if (!medicine) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <h1 className="text-2xl font-bold text-gray-800">Medicine not found</h1>
                <Link href="/marketplace" className="text-teal-600 mt-4 hover:underline">Back to Marketplace</Link>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto">
            <Link
                href="/marketplace"
                className="inline-flex items-center text-gray-500 hover:text-teal-600 mb-6 transition-colors font-medium"
            >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to medicines
            </Link>

            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
                <div className="grid md:grid-cols-2 gap-0">
                    <div className="relative aspect-square bg-gray-50 flex items-center justify-center p-8">
                        <Image
                            src={medicine.image_url || 'https://placehold.co/600'}
                            alt={medicine.name}
                            width={600}
                            height={600}
                            className="object-contain max-h-[80%] drop-shadow-2xl"
                        />
                    </div>

                    <div className="p-8 md:p-10 flex flex-col">
                        <div className="mb-auto">
                            <div className="text-sm font-bold text-teal-600 uppercase tracking-widest mb-2">{medicine.category}</div>
                            <h1 className="text-4xl font-extrabold text-gray-900 mb-4 lh-tight">{medicine.name}</h1>

                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 border-b border-gray-100 pb-8">
                                <div className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full">
                                    <Package className="h-4 w-4" />
                                    <span>{medicine.dosage}</span>
                                </div>
                                <span>•</span>
                                <span>{medicine.manufacturer}</span>
                            </div>

                            <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                                {medicine.description}
                            </p>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3 text-sm text-gray-700">
                                    <ShieldCheck className="h-5 w-5 text-teal-500" />
                                    <span className="font-medium">Genuine Product Guarantee</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-700">
                                    <Truck className="h-5 w-5 text-teal-500" />
                                    <span className="font-medium">Express Delivery Available</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-100">
                            <div className="flex items-end justify-between mb-6">
                                <div>
                                    <span className="text-sm text-gray-500 block mb-1">Price</span>
                                    <span className="text-4xl font-bold text-gray-900">₹{medicine.price}</span>
                                </div>
                                <div className={`text-sm font-medium ${medicine.stock_quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    {medicine.stock_quantity > 0 ? `${medicine.stock_quantity} in stock` : 'Out of stock'}
                                </div>
                            </div>

                            <AddToCartButton
                                medicineId={medicine.id}
                                maxQuantity={medicine.stock_quantity}
                                price={medicine.price}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
