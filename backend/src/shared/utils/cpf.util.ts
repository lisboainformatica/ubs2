export function normalizeCpf(cpf: string): string {
  if (!cpf) return '';
  return cpf.replace(/\D/g, '');
}

export function validateCpf(cpf: string): boolean {
  const cleanCpf = normalizeCpf(cpf);

  if (cleanCpf.length !== 11) return false;

  // Block known invalid CPFs (all identical digits)
  if (/^(\d)\1{10}$/.test(cleanCpf)) return false;

  // Validate first digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cleanCpf.charAt(9))) return false;

  // Validate second digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cleanCpf.charAt(10))) return false;

  return true;
}
