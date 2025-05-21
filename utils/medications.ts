// utils/medications.ts
export async function fetchMedicationSuggestions(term: string): Promise<string[]> {
  try {
    const url = `https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=${encodeURIComponent(
      term
    )}&maxEntries=20`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    // data.approximateGroup.candidate es un array de { rxcui, score, name }
    const candidates = data.approximateGroup?.candidate;
    if (!Array.isArray(candidates)) return [];
    return candidates
      .map((c: any) => c.name)
      .filter((n: any) => typeof n === 'string');
  } catch (e) {
    console.error('fetchMedicationSuggestions error', e);
    return [];
  }
}