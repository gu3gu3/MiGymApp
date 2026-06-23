import { getPlatformPlans } from "@/app/actions/superadmin/plans"
import SuperAdminPlansClient from "./SuperAdminPlansClient"

export const dynamic = 'force-dynamic'

export default async function SuperAdminPlansPage() {
  const plans = await getPlatformPlans()
  return <SuperAdminPlansClient initialPlans={plans} />
}
