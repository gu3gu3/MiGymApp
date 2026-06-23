import { WalletCarousel } from "@/components/wallet/WalletCarousel";
import { ProfileHeader } from "@/components/wallet/ProfileHeader";
import { prisma } from "@/lib/prisma";
import { getMySubscriptions } from "@/app/actions/wallet/get-subscriptions";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { QrCode } from "lucide-react";
import Link from "next/link";
export default async function WalletPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect('/wallet/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    return <div className="p-10 text-white">Usuario no encontrado en la base de datos.</div>;
  }

  const subscriptions = await getMySubscriptions(user.id);
  const activeSub = subscriptions.find((s: any) => s.status === 'ACTIVE')

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center">
      <ProfileHeader 
        user={{ 
          name: user.name, 
          photoUrl: user.image || '', 
          xp: user.xp, 
          level: user.level 
        }}
        gym={{
          name: activeSub?.gymName || 'Sin Gimnasio Activo',
          color: '#94a3b8' 
        }}
      />
      
      <div className="flex-1 w-full flex flex-col justify-center px-4 max-w-md mx-auto">
        {subscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-slate-900 rounded-3xl border border-slate-800 text-center">
            <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mb-4">
              <QrCode className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Aún no tienes un plan</h3>
            <p className="text-slate-400 mb-6 text-sm">
              Escanea el código QR de tu gimnasio para ver sus planes disponibles y solicitar acceso.
            </p>
            <Link 
              href="/wallet/scan"
              className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl transition-colors flex flex-row justify-center items-center gap-2"
            >
              Escanear QR de Gimnasio
            </Link>
          </div>
        ) : (
          <WalletCarousel 
            user={{ id: user.id, name: user.name, photoUrl: user.image || '' }} 
            subscriptions={subscriptions} 
          />
        )}
      </div>
    </main>
  );
}
