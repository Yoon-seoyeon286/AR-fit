// 실제 의류 사이즈 스펙 (단위: cm)
export interface ClothingSpec {
  shoulder: number;  // 어깨 너비
  chest: number;     // 가슴 둘레
  waist: number;     // 허리 둘레
  length: number;    // 총 길이
  armLength: number; // 팔 길이
}

export interface SizeChart {
  [size: string]: ClothingSpec;
}

// 예시: 남성 상의 사이즈 차트
export const menShirtSizes: SizeChart = {
  'XS': {
    shoulder: 42,
    chest: 88,
    waist: 78,
    length: 66,
    armLength: 58
  },
  'S': {
    shoulder: 44,
    chest: 92,
    waist: 82,
    length: 68,
    armLength: 60
  },
  'M': {
    shoulder: 46,
    chest: 96,
    waist: 86,
    length: 70,
    armLength: 62
  },
  'L': {
    shoulder: 48,
    chest: 100,
    waist: 90,
    length: 72,
    armLength: 64
  },
  'XL': {
    shoulder: 50,
    chest: 104,
    waist: 94,
    length: 74,
    armLength: 66
  },
  'XXL': {
    shoulder: 52,
    chest: 108,
    waist: 98,
    length: 76,
    armLength: 68
  }
};

// 여성 상의 사이즈 차트
export const womenShirtSizes: SizeChart = {
  'XS': {
    shoulder: 38,
    chest: 82,
    waist: 68,
    length: 62,
    armLength: 56
  },
  'S': {
    shoulder: 40,
    chest: 86,
    waist: 72,
    length: 64,
    armLength: 58
  },
  'M': {
    shoulder: 42,
    chest: 90,
    waist: 76,
    length: 66,
    armLength: 60
  },
  'L': {
    shoulder: 44,
    chest: 94,
    waist: 80,
    length: 68,
    armLength: 62
  },
  'XL': {
    shoulder: 46,
    chest: 98,
    waist: 84,
    length: 70,
    armLength: 64
  }
};

// 사용자 체형을 실제 치수로 변환
export function estimateUserMeasurements(
  height: number,
  weight: number,
  bodyTypeScales: any
): ClothingSpec {
  // 키와 몸무게로 대략적인 치수 추정
  // 이것은 간단한 추정 공식입니다 (실제로는 더 정교한 공식 필요)
  
  const baseChest = 88 + (weight - 65) * 0.8;
  const baseWaist = 78 + (weight - 65) * 0.9;
  const baseShoulder = 42 + (height - 170) * 0.15;
  const baseArmLength = 58 + (height - 170) * 0.2;
  const baseLength = 66 + (height - 170) * 0.15;
  
  return {
    shoulder: baseShoulder * bodyTypeScales.shoulder,
    chest: baseChest * bodyTypeScales.chest,
    waist: baseWaist * bodyTypeScales.waist,
    length: baseLength,
    armLength: baseArmLength
  };
}

// 가장 적합한 사이즈 찾기
export function findBestSize(
  userMeasurements: ClothingSpec,
  sizeChart: SizeChart
): {
  recommendedSize: string;
  fitDetails: { [key: string]: string };
} {
  let bestSize = 'M';
  let minDifference = Infinity;
  const fitDetails: { [key: string]: string } = {};
  
  // 각 사이즈와 비교
  for (const [size, spec] of Object.entries(sizeChart)) {
    // 가슴, 허리, 어깨를 기준으로 차이 계산
    const diff = 
      Math.abs(spec.chest - userMeasurements.chest) * 2 +  // 가슴이 가장 중요
      Math.abs(spec.waist - userMeasurements.waist) * 1.5 +
      Math.abs(spec.shoulder - userMeasurements.shoulder) * 1.2;
    
    if (diff < minDifference) {
      minDifference = diff;
      bestSize = size;
    }
  }
  
  // 선택된 사이즈와 사용자 체형 비교
  const selectedSpec = sizeChart[bestSize];
  
  // 각 부위별 맞음 여부 판단 (여유분 고려)
  fitDetails.shoulder = selectedSpec.shoulder >= userMeasurements.shoulder - 1 && 
                        selectedSpec.shoulder <= userMeasurements.shoulder + 3 
                        ? '적합' : selectedSpec.shoulder < userMeasurements.shoulder 
                        ? '작음' : '큼';
  
  fitDetails.chest = selectedSpec.chest >= userMeasurements.chest + 4 && 
                     selectedSpec.chest <= userMeasurements.chest + 12 
                     ? '적합' : selectedSpec.chest < userMeasurements.chest + 4 
                     ? '작음' : '큼';
  
  fitDetails.waist = selectedSpec.waist >= userMeasurements.waist + 2 && 
                     selectedSpec.waist <= userMeasurements.waist + 10 
                     ? '적합' : selectedSpec.waist < userMeasurements.waist + 2 
                     ? '작음' : '큼';
  
  return {
    recommendedSize: bestSize,
    fitDetails
  };
}