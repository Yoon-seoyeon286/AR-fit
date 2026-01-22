import * as THREE from 'three';
import { ARScene } from './ar/ARScene';
import { ClothingModel } from './ar/ClothingModel';
import { BodyTypeSelector, type UserBodyData } from './ui/BodyTypeSelector';
import { SizeRecommender } from './ui/SizeRecommender';

class ARFittingApp {
  private arScene: ARScene;
  private clothingModel: ClothingModel;
  private bodyTypeSelector: BodyTypeSelector;
  private sizeRecommender: SizeRecommender;
  
  private userData: UserBodyData | null = null;
  
  // UI 컨트롤 버튼들
  private controlsDiv: HTMLElement;
  private checkSizeBtn: HTMLButtonElement;
  private scaleSlider: HTMLInputElement;
  private scaleValue: HTMLElement;

  constructor() {
    console.log('AR 피팅 앱 초기화 시작...');
    
    // 각 클래스 인스턴스 생성
    this.arScene = new ARScene();
    this.clothingModel = new ClothingModel(
      this.arScene.getScene(),
      this.arScene.getCamera(),
      this.arScene.getRenderer()
    );
    this.bodyTypeSelector = new BodyTypeSelector();
    this.sizeRecommender = new SizeRecommender();
    
    // UI 요소들 가져오기
    this.controlsDiv = document.getElementById('controls') as HTMLElement;
    this.checkSizeBtn = document.getElementById('check-size') as HTMLButtonElement;
    this.scaleSlider = document.getElementById('scale-slider') as HTMLInputElement;
    this.scaleValue = document.getElementById('scale-value') as HTMLElement;
    
    // 이벤트 리스너 설정
    this.setupEventListeners();
    
    console.log('AR 피팅 앱 초기화 완료');
  }

  private setupEventListeners(): void {
    // 체형 선택 완료시 AR 시작
    this.bodyTypeSelector.onStart((userData) => {
      this.userData = userData;
      this.startARMode();
    });
    
    // 슬라이더 이벤트
    this.scaleSlider.addEventListener('input', () => {
      const scale = parseFloat(this.scaleSlider.value);
      this.clothingModel.setUserScale(scale);
      
      // 퍼센트 표시 업데이트
      const percent = Math.round(scale * 100);
      this.scaleValue.textContent = `${percent}%`;
    });
    
    // 사이즈 확인 버튼
    this.checkSizeBtn.addEventListener('click', () => {
      this.showSizeRecommendation();
    });
  }

  private async startARMode(): Promise<void> {
    if (!this.userData) return;

    console.log('AR 모드 시작...', this.userData);

    try {
      // 1. 카메라 시작
      console.log('카메라 시작 중...');
      await this.arScene.startCamera();

      // 2. 3D 모델 로드
      console.log('3D 모델 로드 중...');
      await this.loadTestModel();

      // 3. 체형에 맞게 모델 스케일 조정
      console.log('체형 스케일 적용 중...');
      this.clothingModel.applyBodyTypeScale(this.userData);

      // 4. 사이즈 계산
      this.sizeRecommender.calculateSize(this.userData);

      // 5. 렌더링 시작
      this.arScene.startRenderLoop();

      // 6. 컨트롤 버튼 표시
      this.controlsDiv.classList.add('active');

      console.log('AR 모드 시작 완료');
    } catch (error) {
      console.error('AR 모드 시작 오류:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      alert(`AR 모드 오류: ${errorMessage}`);
    }
  }

  private async loadTestModel(): Promise<void> {
    console.log('테스트 모델 생성 중...');
    

    await this.clothingModel.loadModel('/assets/models/sh.glb');
  }

  private showSizeRecommendation(): void {
    this.sizeRecommender.showRecommendation();
  }
}

// 앱 시작
console.log('앱 로딩 시작...');
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM 로드 완료, 앱 초기화...');
  new ARFittingApp();
});