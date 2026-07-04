export interface MockSubscription {
  id: string
  gymName: string
  gymLogo: string
  gymBanner?: string | null
  status: 'ACTIVE' | 'EXPIRED' | 'PENDING' | 'FROZEN' | 'CANCELED' | string
  planName: string
  planType?: 'TIME_BASED' | 'CREDIT_BASED'
  startDate?: Date
  endDate?: Date | null
  remainingTotal?: number | null
  totalCredits?: number | null
  offlineToken: string // Simula el JWT guardado
  themeColor: string
}

export const mockUser = {
  name: "Atleta Pro",
  photoUrl: "https://i.pravatar.cc/150?u=atletapro"
}

export const mockSubscriptions: MockSubscription[] = [
  {
    id: "sub_1",
    gymName: "Titanium Gym",
    gymLogo: "T",
    status: "ACTIVE",
    planName: "Pase Mensual VIP",
    offlineToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.titanium_offline_mock.signature",
    themeColor: "from-blue-950 to-slate-900"
  },
  {
    id: "sub_2",
    gymName: "Iron Box Crossfit",
    gymLogo: "IB",
    status: "ACTIVE",
    planName: "Plan 12 Clases",
    offlineToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ironbox_offline_mock.signature",
    themeColor: "from-emerald-950 to-zinc-900"
  },
  {
    id: "sub_3",
    gymName: "FitLife Center",
    gymLogo: "FL",
    status: "EXPIRED",
    planName: "Prueba 7 Días",
    offlineToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fitlife_expired.signature",
    themeColor: "from-red-950 to-neutral-900"
  }
]
