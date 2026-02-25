/**
 * Location Types
 * CEP, cidades, geocoding inverso e labels de posição
 */

export interface CepResult {
  cep: string;          // "69037-400"
  logradouro: string;   // "Rua Francisca Júlia"
  complemento: string;
  bairro: string;       // "Nova Esperança"
  cidade: string;       // "Manaus"
  uf: string;           // "AM"
  estado: string;       // "Amazonas"
  ddd: string;          // "92"
  ibge: string;         // "1302603"
}

export interface City {
  nome: string;         // "Manaus"
  codigoIbge: string;   // "1302603"
}

export interface LocationLabel {
  label: string;        // "Próximo a Iranduba, Amazonas"
}

export interface ReverseGeocode {
  label: string;
  logradouro?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
}

/** Lista estática de fallback — usada se a API /locations/cities falhar */
export const AM_CITIES_FALLBACK: string[] = [
  'Autazes',
  'Barreirinha',
  'Benjamin Constant',
  'Beruri',
  'Borba',
  'Careiro',
  'Coari',
  'Fonte Boa',
  'Humaitá',
  'Iranduba',
  'Itacoatiara',
  'Lábrea',
  'Manacapuru',
  'Manaus',
  'Manicoré',
  'Maués',
  'Nova Olinda do Norte',
  'Parintins',
  'São Gabriel da Cachoeira',
  'Tabatinga',
  'Tefé',
];
