import { PortfolioSummary } from "./portfolio-summary"
import { QuickActions } from "./quick-actions"
import { ActivePositions } from "./active-positions"

export function PortfolioOverview() {
  return (
    <div className="space-y-6">
      <PortfolioSummary />
      <QuickActions />
      <ActivePositions />
    </div>
  )
}
