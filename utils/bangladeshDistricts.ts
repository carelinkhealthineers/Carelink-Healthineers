export interface DistrictMetadata {
  id: string;
  name: string;
  division:
    | 'Dhaka'
    | 'Chattogram'
    | 'Rajshahi'
    | 'Khulna'
    | 'Barishal'
    | 'Sylhet'
    | 'Rangpur'
    | 'Mymensingh';
  aliases: string[];
  // Normalized schematic map coordinates (0-100 scale for interactive Bangladesh SVG map)
  mapX: number;
  mapY: number;
}

export const BANGLADESH_DIVISIONS = [
  'Dhaka',
  'Chattogram',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Sylhet',
  'Rangpur',
  'Mymensingh',
] as const;

export type BangladeshDivisionName = (typeof BANGLADESH_DIVISIONS)[number];

/**
 * Complete authoritative list of all 64 Districts across 8 Divisions of Bangladesh.
 */
export const BANGLADESH_64_DISTRICTS: DistrictMetadata[] = [
  // 1. Dhaka Division (13 Districts)
  { id: 'dhaka', name: 'Dhaka', division: 'Dhaka', aliases: ['dacca', 'savar', 'dhamrai', 'keraniganj', 'uttara', 'mirpur', 'gulshan', 'banani', 'dhanmondi', 'motijheel', 'shyamoli', 'adabor', 'mohammadpur', 'tejgaon'], mapX: 52, mapY: 52 },
  { id: 'gazipur', name: 'Gazipur', division: 'Dhaka', aliases: ['tongi', 'joydebpur', 'kaliakair', 'sreepur'], mapX: 53, mapY: 46 },
  { id: 'narayanganj', name: 'Narayanganj', division: 'Dhaka', aliases: ['fatullah', 'siddhirganj', 'rupganj', 'sonargaon', 'araihazar'], mapX: 56, mapY: 54 },
  { id: 'narsingdi', name: 'Narsingdi', division: 'Dhaka', aliases: ['narshingdi', 'madhabdi', 'raipura', 'shibpur'], mapX: 60, mapY: 49 },
  { id: 'munshiganj', name: 'Munshiganj', division: 'Dhaka', aliases: ['bikrampur', 'sreenagar', 'lohajang'], mapX: 54, mapY: 58 },
  { id: 'manikganj', name: 'Manikganj', division: 'Dhaka', aliases: ['singair', 'saturia', 'aricha'], mapX: 46, mapY: 52 },
  { id: 'tangail', name: 'Tangail', division: 'Dhaka', aliases: ['mirzapur', 'madhupur', 'sakhipur', 'bhuapur'], mapX: 46, mapY: 42 },
  { id: 'kishoreganj', name: 'Kishoreganj', division: 'Dhaka', aliases: ['bhairab', 'bajitpur', 'kuliarchar', 'itna'], mapX: 62, mapY: 42 },
  { id: 'faridpur', name: 'Faridpur', division: 'Dhaka', aliases: ['bhanga', 'boalmari', 'madhukhali'], mapX: 44, mapY: 59 },
  { id: 'gopalganj', name: 'Gopalganj', division: 'Dhaka', aliases: ['tungipara', 'kotalipara', 'muksudpur'], mapX: 46, mapY: 67 },
  { id: 'madaripur', name: 'Madaripur', division: 'Dhaka', aliases: ['shibchar', 'kalkini', 'rajoir'], mapX: 50, mapY: 64 },
  { id: 'shariatpur', name: 'Shariatpur', division: 'Dhaka', aliases: ['aria', 'naria', 'zajira', 'bhedarganj'], mapX: 54, mapY: 63 },
  { id: 'rajbari', name: 'Rajbari', division: 'Dhaka', aliases: ['goalanda', 'pangsha', 'baliakandi'], mapX: 40, mapY: 56 },

  // 2. Chattogram Division (11 Districts)
  { id: 'chattogram', name: 'Chattogram', division: 'Chattogram', aliases: ['chittagong', 'ctg', 'agrabad', 'panchlaish', 'halishahar', 'patenga', 'sitakunda', 'mirsharai', 'patiya', 'boalkhali', 'anwara', 'hatzazari', 'raozan'], mapX: 78, mapY: 75 },
  { id: 'coxs-bazar', name: "Cox's Bazar", division: 'Chattogram', aliases: ['coxsbazar', 'coxs bazar', 'teknaf', 'ukhiya', 'chakaria', 'ramu', 'maheshkhali'], mapX: 80, mapY: 90 },
  { id: 'cumilla', name: 'Cumilla', division: 'Chattogram', aliases: ['comilla', 'daudkandi', 'laksam', 'chandina', 'debidwar', 'burichang'], mapX: 67, mapY: 57 },
  { id: 'brahmanbaria', name: 'Brahmanbaria', division: 'Chattogram', aliases: ['b-baria', 'ashuganj', 'kasba', 'sarail', 'nabinagar', 'akhaura'], mapX: 66, mapY: 49 },
  { id: 'chandpur', name: 'Chandpur', division: 'Chattogram', aliases: ['hajiganj', 'matlab', 'kachua', 'faridganj'], mapX: 60, mapY: 62 },
  { id: 'lakshmipur', name: 'Lakshmipur', division: 'Chattogram', aliases: ['laxmipur', 'raipur', 'ramganj', 'ramgati'], mapX: 62, mapY: 68 },
  { id: 'noakhali', name: 'Noakhali', division: 'Chattogram', aliases: ['maijdee', 'begumganj', 'chowmuhani', 'companiganj', 'hatiya', 'senbagh'], mapX: 67, mapY: 69 },
  { id: 'feni', name: 'Feni', division: 'Chattogram', aliases: ['chhagalnaiya', 'daganbhuiyan', 'parshuram', 'sonagazi'], mapX: 72, mapY: 66 },
  { id: 'khagrachhari', name: 'Khagrachhari', division: 'Chattogram', aliases: ['khagrachari', 'ramgarh', 'matiranga', 'dighinala'], mapX: 82, mapY: 66 },
  { id: 'rangamati', name: 'Rangamati', division: 'Chattogram', aliases: ['kaptai', 'baghaichhari', 'barkal', 'kawkhali'], mapX: 86, mapY: 74 },
  { id: 'bandarban', name: 'Bandarban', division: 'Chattogram', aliases: ['lama', 'alikadam', 'naikhongchhari', 'ruma', 'thanchi'], mapX: 86, mapY: 85 },

  // 3. Rajshahi Division (8 Districts)
  { id: 'rajshahi', name: 'Rajshahi', division: 'Rajshahi', aliases: ['boalia', 'motihar', 'godagari', 'paba', 'bagmara', 'puthia', 'charghat'], mapX: 20, mapY: 44 },
  { id: 'bogura', name: 'Bogura', division: 'Rajshahi', aliases: ['bogra', 'sherpur bogra', 'shajahanpur', 'shibganj', 'dupchanchia'], mapX: 34, mapY: 36 },
  { id: 'pabna', name: 'Pabna', division: 'Rajshahi', aliases: ['ishwardi', 'bera', 'santhia', 'sujanagar', 'chatmohar'], mapX: 35, mapY: 50 },
  { id: 'sirajganj', name: 'Sirajganj', division: 'Rajshahi', aliases: ['ullapara', 'shahjadpur', 'belkuchi', 'kazipur', 'raiganj'], mapX: 40, mapY: 44 },
  { id: 'natore', name: 'Natore', division: 'Rajshahi', aliases: ['singra', 'baraigram', 'lalpur', 'gurudaspur'], mapX: 28, mapY: 46 },
  { id: 'naogaon', name: 'Naogaon', division: 'Rajshahi', aliases: ['badalgachhi', 'mahadebpur', 'patnitala', 'sapahar'], mapX: 24, mapY: 35 },
  { id: 'joypurhat', name: 'Joypurhat', division: 'Rajshahi', aliases: ['jaipurhat', 'panchbibi', 'kalai', 'akkelpur'], mapX: 29, mapY: 30 },
  { id: 'chapainawabganj', name: 'Chapainawabganj', division: 'Rajshahi', aliases: ['chapai nawabganj', 'nawabganj', 'shibganj chapai', 'gomastapur'], mapX: 14, mapY: 39 },

  // 4. Khulna Division (10 Districts)
  { id: 'khulna', name: 'Khulna', division: 'Khulna', aliases: ['khalishpur', 'daulatpur', 'sonadanga', 'dumuria', 'paikgachha', 'batiaghata'], mapX: 38, mapY: 74 },
  { id: 'jashore', name: 'Jashore', division: 'Khulna', aliases: ['jessore', 'benapole', 'sharsha', 'abhaynagar', 'jhikargachha', 'manirampur'], mapX: 31, mapY: 67 },
  { id: 'satkhira', name: 'Satkhira', division: 'Khulna', aliases: ['shyamnagar', 'kaliganj satkhira', 'tala', 'kalaroa'], mapX: 26, mapY: 76 },
  { id: 'bagerhat', name: 'Bagerhat', division: 'Khulna', aliases: ['mongla', 'fakirhat', 'mollahat', 'morrelganj'], mapX: 43, mapY: 76 },
  { id: 'jhenaidah', name: 'Jhenaidah', division: 'Khulna', aliases: ['jhenaidaha', 'kaliganj jhenaidah', 'shailkupa', 'harinakundu'], mapX: 30, mapY: 61 },
  { id: 'narail', name: 'Narail', division: 'Khulna', aliases: ['lohagara', 'kalia'], mapX: 37, mapY: 66 },
  { id: 'magura', name: 'Magura', division: 'Khulna', aliases: ['sreepur magura', 'mohammadpur magura', 'shalikha'], mapX: 36, mapY: 61 },
  { id: 'kushtia', name: 'Kushtia', division: 'Khulna', aliases: ['kumarkhali', 'bheramara', 'mirpur kushtia', 'daulatpur kushtia'], mapX: 28, mapY: 54 },
  { id: 'chuadanga', name: 'Chuadanga', division: 'Khulna', aliases: ['alamdanga', 'damurhuda', 'jibannagar'], mapX: 23, mapY: 59 },
  { id: 'meherpur', name: 'Meherpur', division: 'Khulna', aliases: ['mujibnagar', 'gangni'], mapX: 19, mapY: 55 },

  // 5. Barishal Division (6 Districts)
  { id: 'barishal', name: 'Barishal', division: 'Barishal', aliases: ['barisal', 'bakerganj', 'gournadi', 'mehendiganj', 'babuganj'], mapX: 54, mapY: 73 },
  { id: 'patuakhali', name: 'Patuakhali', division: 'Barishal', aliases: ['kuakata', 'kalapara', 'bauphal', 'galachipa', 'payra'], mapX: 55, mapY: 82 },
  { id: 'bhola', name: 'Bhola', division: 'Barishal', aliases: ['char fasson', 'lalmohan', 'borhanuddin', 'daulatkhan'], mapX: 61, mapY: 78 },
  { id: 'pirojpur', name: 'Pirojpur', division: 'Barishal', aliases: ['mathbaria', 'nesarabad', 'swarupkathi', 'bhandaria'], mapX: 48, mapY: 75 },
  { id: 'barguna', name: 'Barguna', division: 'Barishal', aliases: ['amtali', 'patharghata', 'betagi'], mapX: 50, mapY: 84 },
  { id: 'jhalokati', name: 'Jhalokati', division: 'Barishal', aliases: ['jhalokathi', 'nalchity', 'rajapur'], mapX: 51, mapY: 74 },

  // 6. Sylhet Division (4 Districts)
  { id: 'sylhet', name: 'Sylhet', division: 'Sylhet', aliases: ['zindabazar', 'amberkhana', 'beanibazar', 'golapganj', 'fenchuganj', 'gowainghat', 'zakiganj'], mapX: 80, mapY: 34 },
  { id: 'moulvibazar', name: 'Moulvibazar', division: 'Sylhet', aliases: ['maulvibazar', 'sreemangal', 'kulaura', 'kamalganj', 'barlekha'], mapX: 79, mapY: 44 },
  { id: 'habiganj', name: 'Habiganj', division: 'Sylhet', aliases: ['shaistaganj', 'madhabpur', 'chunarughat', 'nabiganj', 'bahubal'], mapX: 72, mapY: 46 },
  { id: 'sunamganj', name: 'Sunamganj', division: 'Sylhet', aliases: ['chhatak', 'jagannathpur', 'derai', 'tahirpur'], mapX: 72, mapY: 34 },

  // 7. Rangpur Division (8 Districts)
  { id: 'rangpur', name: 'Rangpur', division: 'Rangpur', aliases: ['mithapukur', 'badarganj', 'pirganj rangpur', 'kaunia', 'gangachara'], mapX: 30, mapY: 20 },
  { id: 'dinajpur', name: 'Dinajpur', division: 'Rangpur', aliases: ['parbatipur', 'birampur', 'phulbari', 'biral', 'birganj'], mapX: 21, mapY: 22 },
  { id: 'kurigram', name: 'Kurigram', division: 'Rangpur', aliases: ['ulipur', 'nageshwari', 'bhurungamari', 'chilmari'], mapX: 38, mapY: 21 },
  { id: 'gaibandha', name: 'Gaibandha', division: 'Rangpur', aliases: ['gobindaganj', 'palashbari', 'sundarganj', 'sadullapur'], mapX: 35, mapY: 28 },
  { id: 'nilphamari', name: 'Nilphamari', division: 'Rangpur', aliases: ['saidpur', 'domar', 'jaldhaka', 'kishoreganj nilphamari'], mapX: 25, mapY: 15 },
  { id: 'lalmonirhat', name: 'Lalmonirhat', division: 'Rangpur', aliases: ['patgram', 'hatibandha', 'kaliganj lalmonirhat', 'aditmari'], mapX: 33, mapY: 15 },
  { id: 'thakurgaon', name: 'Thakurgaon', division: 'Rangpur', aliases: ['pirganj thakurgaon', 'ranisankail', 'baliadangi'], mapX: 16, mapY: 15 },
  { id: 'panchagarh', name: 'Panchagarh', division: 'Rangpur', aliases: ['tetulia', 'boda', 'debiganj', 'atwari'], mapX: 18, mapY: 9 },

  // 8. Mymensingh Division (4 Districts)
  { id: 'mymensingh', name: 'Mymensingh', division: 'Mymensingh', aliases: ['trishal', 'bhaluka', 'gafargaon', 'muktagachha', 'phulpur', 'ishwarganj'], mapX: 53, mapY: 36 },
  { id: 'jamalpur', name: 'Jamalpur', division: 'Mymensingh', aliases: ['sarishabari', 'melandaha', 'islampur', 'dewanganj'], mapX: 44, mapY: 34 },
  { id: 'sherpur', name: 'Sherpur', division: 'Mymensingh', aliases: ['nalitabari', 'jhenaigati', 'nakla', 'sreebardi'], mapX: 47, mapY: 29 },
  { id: 'netrokona', name: 'Netrokona', division: 'Mymensingh', aliases: ['netrakona', 'kendua', 'mohanganj', 'durgapur netrokona', 'kalmakanda'], mapX: 61, mapY: 34 },
];

export const UNKNOWN_LOCATION_ID = 'unknown_location';
export const INTERNATIONAL_LOCATION_ID = 'international';

/**
 * Resolves a raw city, region, or address string into one of Bangladesh's 64 canonical districts.
 * Returns null if the string cannot be reliably mapped to a Bangladesh district.
 */
export const matchBangladeshDistrict = (
  rawCityOrText?: string | null,
  rawRegion?: string | null,
  rawCountry?: string | null
): DistrictMetadata | null => {
  const combined = `${rawCityOrText || ''} ${rawRegion || ''}`.toLowerCase().trim();
  if (!combined) return null;

  // First check exact district name match
  for (const dist of BANGLADESH_64_DISTRICTS) {
    const lowerName = dist.name.toLowerCase();
    if (
      combined === lowerName ||
      combined.includes(lowerName)
    ) {
      return dist;
    }
  }

  // Next check known aliases / upazilas / alternate spellings (e.g. Chittagong -> Chattogram)
  for (const dist of BANGLADESH_64_DISTRICTS) {
    for (const alias of dist.aliases) {
      if (combined.includes(alias.toLowerCase())) {
        return dist;
      }
    }
  }

  // If country is explicitly outside Bangladesh and not matched
  if (
    rawCountry &&
    rawCountry.trim() &&
    !rawCountry.toLowerCase().includes('bangladesh') &&
    rawCountry.toLowerCase() !== 'bd'
  ) {
    return null;
  }

  return null;
};
