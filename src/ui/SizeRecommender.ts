import { 
  estimateUserMeasurements, 
  findBestSize, 
  menShirtSizes,
  type ClothingSpec 
} from '../data/clothingSizes';
import type { UserBodyData } from './BodyTypeSelector';

export class SizeRecommender {
  private resultPanel: HTMLElement;
  private sizeDisplay: HTMLElement;
  private fitDetailsDisplay: HTMLElement;
  
  private userMeasurements: ClothingSpec | null = null;

  constructor() {
    this.resultPanel = document.getElementById('size-result') as HTMLElement;
    this.sizeDisplay = document.getElementById('recommended-size') as HTMLElement;
    this.fitDetailsDisplay = document.getElementById('fit-details') as HTMLElement;
  }

  public calculateSize(userData: UserBodyData): void {
    // 사용자의 추정 치수 계산
    this.userMeasurements = estimateUserMeasurements(
      userData.height,
      userData.weight,
      userData.bodyTypeScale
    );
    
    // 키와 몸무게로 전체 스케일 적용
    this.userMeasurements.shoulder *= userData.overallScale;
    this.userMeasurements.chest *= userData.overallScale;
    this.userMeasurements.waist *= userData.overallScale;
  }

  public showRecommendation(): void {
    if (!this.userMeasurements) {
      console.error('먼저 calculateSize를 호출해야 합니다');
      return;
    }
    
    // 가장 적합한 사이즈 찾기
    const result = findBestSize(this.userMeasurements, menShirtSizes);
    
    // 결과 표시
    this.sizeDisplay.innerHTML = `
      <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">
        ${result.recommendedSize}
      </div>
      <div style="font-size: 12px; color: #666; margin-bottom: 15px;">
        추정 치수:
      </div>
      <div style="font-size: 11px; color: #888; line-height: 1.6;">
        어깨: ${this.userMeasurements.shoulder.toFixed(1)}cm<br>
        가슴: ${this.userMeasurements.chest.toFixed(1)}cm<br>
        허리: ${this.userMeasurements.waist.toFixed(1)}cm
      </div>
    `;
    
    // 핏 상세 정보
    let fitDetailsHTML = '<div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e0e0e0;">';
    fitDetailsHTML += '<div style="font-size: 12px; color: #666; margin-bottom: 10px;">부위별 핏:</div>';
    
    for (const [part, fit] of Object.entries(result.fitDetails)) {
      let fitColor = '#4CAF50'; // 적합 - 녹색
      if (fit === '작음') fitColor = '#f44336'; // 빨강
      if (fit === '큼') fitColor = '#FF9800'; // 주황
      
      const partNames: { [key: string]: string } = {
        'shoulder': '어깨',
        'chest': '가슴',
        'waist': '허리'
      };
      
      fitDetailsHTML += `
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
          <span>${partNames[part]}:</span>
          <span style="color: ${fitColor}; font-weight: bold;">${fit}</span>
        </div>
      `;
    }
    
    fitDetailsHTML += '</div>';
    this.fitDetailsDisplay.innerHTML = fitDetailsHTML;
    
    // 패널 표시
    this.resultPanel.classList.add('active');
  }

  public hide(): void {
    this.resultPanel.classList.remove('active');
  }

  public getUserMeasurements(): ClothingSpec | null {
    return this.userMeasurements;
  }
}