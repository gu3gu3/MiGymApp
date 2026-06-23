import { getPublicCompetitions } from "@/app/actions/public/landing"
import { LandingClient } from "@/components/public/LandingClient"

// Revalidate public landing data every hour, or rely on dynamic fetching.
// Para propósitos de este entorno, lo dejamos dinámico.
export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  const competitions = await getPublicCompetitions()
  
  return <LandingClient competitions={competitions} />
}
