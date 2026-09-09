/**
 * Calculation Engine for Salary Allocation Rules
 */

export const DEFAULT_RULE = {
  home_pct: 35.0,
  invest_pct: 25.0,
  emergency_pct: 10.0,
  travel_pct: 15.0,
  personal_pct: 15.0
};

export function validateRulePercentages(rule) {
  const { home_pct, invest_pct, emergency_pct, travel_pct, personal_pct } = rule;
  const total = Number(home_pct) + Number(invest_pct) + Number(emergency_pct) + Number(travel_pct) + Number(personal_pct);
  // Allow tiny floating point rounding tolerance
  return Math.abs(total - 100) < 0.01;
}

export function calculateSalaryAllocation(salary, rule = DEFAULT_RULE) {
  const numSalary = Number(salary);
  if (isNaN(numSalary) || numSalary < 0) {
    throw new Error('Salary must be a non-negative number');
  }

  const home = Math.round((numSalary * (rule.home_pct / 100)) * 100) / 100;
  const investment = Math.round((numSalary * (rule.invest_pct / 100)) * 100) / 100;
  const emergency = Math.round((numSalary * (rule.emergency_pct / 100)) * 100) / 100;
  const travel = Math.round((numSalary * (rule.travel_pct / 100)) * 100) / 100;
  const personal = Math.round((numSalary * (rule.personal_pct / 100)) * 100) / 100;

  const totalAllocated = home + investment + emergency + travel + personal;

  return {
    salary: numSalary,
    rule: {
      home_pct: rule.home_pct,
      invest_pct: rule.invest_pct,
      emergency_pct: rule.emergency_pct,
      travel_pct: rule.travel_pct,
      personal_pct: rule.personal_pct
    },
    allocations: {
      home: { amount: home, percentage: rule.home_pct, label: 'Home Expense' },
      investment: { amount: investment, percentage: rule.invest_pct, label: 'Investment' },
      emergency: { amount: emergency, percentage: rule.emergency_pct, label: 'Emergency Fund' },
      travel: { amount: travel, percentage: rule.travel_pct, label: 'Car / Travel' },
      personal: { amount: personal, percentage: rule.personal_pct, label: 'Personal Expense' }
    },
    totalAllocated
  };
}

export function calculateGoalTimeline(targetAmount, currentAmount, monthlyContribution) {
  const remaining = Math.max(0, targetAmount - currentAmount);
  if (monthlyContribution <= 0) return { months: Infinity, status: 'No active monthly contribution' };
  const months = Math.ceil(remaining / monthlyContribution);
  return {
    targetAmount,
    currentAmount,
    remaining,
    monthlyContribution,
    monthsNeeded: months,
    progressPercentage: Math.min(100, Math.round((currentAmount / targetAmount) * 1000) / 10)
  };
}
