import { type BudgetSnapshot, DATA_PATH, DEPARTMENTS } from './data';

export async function loadDepartmentBudgets(
  signal: AbortSignal,
): Promise<BudgetSnapshot> {
  const response = await fetch(DATA_PATH, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]),
    headers: { Accept: 'application/json' },
  });
  if (!response.ok)
    throw new Error(`Budget snapshot unavailable (HTTP ${response.status}).`);
  const snapshot: BudgetSnapshot = await response.json();
  if (
    snapshot.schema !== 1 ||
    snapshot.fiscalYear !== 2027 ||
    snapshot.currency !== 'PHP' ||
    snapshot.scale !== 'pesos' ||
    !Number.isFinite(Date.parse(snapshot.builtAt)) ||
    !Number.isFinite(Date.parse(snapshot.retrievedAt)) ||
    !Array.isArray(snapshot.departments) ||
    snapshot.departments.length !== DEPARTMENTS.length ||
    DEPARTMENTS.some(
      (expected) =>
        !snapshot.departments.some(
          (department) =>
            department.id === expected.id &&
            Array.isArray(department.regions) &&
            Array.isArray(department.agencies) &&
            [
              department.nep,
              department.house,
              department.allFunds,
              department.automatic,
              department.elsewhere,
            ].every((amount) => Number.isSafeInteger(amount) && amount >= 0),
        ),
    )
  )
    throw new Error(
      'The budget snapshot format is invalid. Please try again later.',
    );
  return snapshot;
}
