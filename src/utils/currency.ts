export const formatCurrency = (value: number, currencyCode: 'BRL' | 'USD' | 'EUR' | string) => {
  switch (currencyCode) {
    case 'USD':
      return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    case 'EUR':
      return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
    case 'BRL':
    default:
      return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
};
