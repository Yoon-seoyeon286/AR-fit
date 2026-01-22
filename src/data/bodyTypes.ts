// 체형별 bone scale 설정
// 각 값은 기본 크기(1.0) 대비 비율입니다

export interface BodyTypeScale {
  shoulder: number;    // 어깨 너비
  chest: number;       // 가슴 둘레
  waist: number;       // 허리 둘레
  hip: number;         // 엉덩이 둘레
  arm: number;         // 팔 굵기
  leg: number;         // 다리 굵기
}

export interface BodyType {
  name: string;
  description: string;
  scale: BodyTypeScale;
}

export const bodyTypes: Record<string, BodyType> = {
  'inverted-triangle': {
    name: '역삼각형',
    description: '어깨가 넓고 허리가 얇은 체형',
    scale: {
      shoulder: 1.2,   // 어깨 20% 더 넓음
      chest: 1.15,     // 가슴 15% 더 큼
      waist: 0.9,      // 허리 10% 더 얇음
      hip: 0.95,       // 엉덩이 5% 더 작음
      arm: 1.1,        // 팔 10% 더 굵음
      leg: 1.0,        // 다리 기본
    }
  },
  'triangle': {
    name: '삼각형',
    description: '하체가 발달한 체형',
    scale: {
      shoulder: 0.9,   // 어깨 10% 더 좁음
      chest: 0.95,     // 가슴 5% 더 작음
      waist: 1.0,      // 허리 기본
      hip: 1.2,        // 엉덩이 20% 더 큼
      arm: 0.95,       // 팔 5% 더 가늘음
      leg: 1.15,       // 다리 15% 더 굵음
    }
  },
  'rectangle': {
    name: '사각형',
    description: '전체적으로 균형잡힌 체형',
    scale: {
      shoulder: 1.0,   // 모든 부위 기본
      chest: 1.0,
      waist: 1.0,
      hip: 1.0,
      arm: 1.0,
      leg: 1.0,
    }
  },
  'round': {
    name: '원형',
    description: '배와 허리 둘레가 큰 체형',
    scale: {
      shoulder: 1.0,   // 어깨 기본
      chest: 1.15,     // 가슴 15% 더 큼
      waist: 1.25,     // 허리 25% 더 큼 (가장 큰 특징)
      hip: 1.15,       // 엉덩이 15% 더 큼
      arm: 1.1,        // 팔 10% 더 굵음
      leg: 1.05,       // 다리 5% 더 굵음
    }
  },
  'slim': {
    name: '마른체형',
    description: '전체적으로 가늘고 긴 체형',
    scale: {
      shoulder: 0.85,  // 어깨 15% 더 좁음
      chest: 0.85,     // 가슴 15% 더 작음
      waist: 0.8,      // 허리 20% 더 얇음
      hip: 0.85,       // 엉덩이 15% 더 작음
      arm: 0.8,        // 팔 20% 더 가늘음
      leg: 0.9,        // 다리 10% 더 가늘음
    }
  },
  'hourglass': {
    name: '모래시계형',
    description: '어깨와 엉덩이가 넓고 허리가 잘록한 체형',
    scale: {
      shoulder: 1.1,   // 어깨 10% 더 넓음
      chest: 1.1,      // 가슴 10% 더 큼
      waist: 0.8,      // 허리 20% 더 얇음
      hip: 1.15,       // 엉덩이 15% 더 큼
      arm: 0.95,       // 팔 5% 더 가늘음
      leg: 1.05,       // 다리 5% 더 굵음
    }
  }
};

// 키와 몸무게를 고려한 전체 스케일 계산
export function calculateOverallScale(height: number, weight: number): number {
  // BMI 기반 전체 크기 보정
  // 표준 키 170cm, 몸무게 65kg을 기준(1.0)으로 계산
  const heightRatio = height / 170;
  const weightRatio = weight / 65;
  
  // 키의 영향을 더 크게 (70%), 몸무게 영향은 작게 (30%)
  const overallScale = (heightRatio * 0.7) + (weightRatio * 0.3);
  
  return overallScale;
}