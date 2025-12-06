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
  private moveUpBtn: HTMLButtonElement;
  private moveDownBtn: HTMLButtonElement;
  private rotateLeftBtn: HTMLButtonElement;
  private rotateRightBtn: HTMLButtonElement;
  private checkSizeBtn: HTMLButtonElement;

  constructor() {
    console.log('AR 피팅 앱 초기화 시작...');
    
    // 각 클래스 인스턴스 생성
    this.arScene = new ARScene();
    this.clothingModel = new ClothingModel(this.arScene.getScene());
    this.bodyTypeSelector = new BodyTypeSelector();
    this.sizeRecommender = new SizeRecommender();
    
    // UI 버튼들 가져오기
    this.controlsDiv = document.getElementById('controls') as HTMLElement;
    this.moveUpBtn = document.getElementById('move-up') as HTMLButtonElement;
    this.moveDownBtn = document.getElementById('move-down') as HTMLButtonElement;
    this.rotateLeftBtn = document.getElementById('rotate-left') as HTMLButtonElement;
    this.rotateRightBtn = document.getElementById('rotate-right') as HTMLButtonElement;
    this.checkSizeBtn = document.getElementById('check-size') as HTMLButtonElement;
    
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
    
    // 컨트롤 버튼 이벤트
    this.moveUpBtn.addEventListener('click', () => {
      this.clothingModel.moveUp(0.1);
    });
    
    this.moveDownBtn.addEventListener('click', () => {
      this.clothingModel.moveDown(0.1);
    });
    
    this.rotateLeftBtn.addEventListener('click', () => {
      this.clothingModel.rotateLeft(0.1);
    });
    
    this.rotateRightBtn.addEventListener('click', () => {
      this.clothingModel.rotateRight(0.1);
    });
    
    this.checkSizeBtn.addEventListener('click', () => {
      this.showSizeRecommendation();
    });
  }

  private async startARMode(): Promise<void> {
    if (!this.userData) return;
    
    console.log('AR 모드 시작...', this.userData);
    
    try {
      // 1. 카메라 시작
      await this.arScene.startCamera();
      
      // 2. 3D 모델 로드
      // 일단 테스트용으로 간단한 박스를 만들어봅시다
      // 나중에 실제 GLB 파일로 교체할 예정
      await this.loadTestModel();
      
      // 3. 체형에 맞게 모델 스케일 조정
      this.clothingModel.applyBodyTypeScale(this.userData);
      
      // 4. 사이즈 계산 (미리 계산해둠)
      this.sizeRecommender.calculateSize(this.userData);
      
      // 5. 렌더링 시작
      this.arScene.startRenderLoop();
      
      // 6. 컨트롤 버튼 표시
      this.controlsDiv.classList.add('active');
      
      console.log('AR 모드 시작 완료');
    } catch (error) {
      console.error('AR 모드 시작 오류:', error);
      alert('AR 모드를 시작할 수 없습니다. 콘솔을 확인해주세요.');
    }
  }

  private async loadTestModel(): Promise<void> {
    // 실제 GLB 모델이 없으므로 임시로 박스를 만듭니다
    // 나중에 이 부분을 실제 모델 로딩으로 교체할 예정
    
    console.log('테스트 모델 생성 중...');
    
    // Three.js로 간단한 티셔츠 모양 만들기
    const geometry = new THREE.BoxGeometry(1, 1.5, 0.3);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x4CAF50,
      roughness: 0.7,
      metalness: 0.1
    });
    const mesh = new THREE.Mesh(geometry, material);
    
    // Group으로 감싸기 (실제 GLB 모델처럼)
    const group = new THREE.Group();
    group.add(mesh);
    
    // ClothingModel에 직접 추가
    const scene = this.arScene.getScene();
    scene.add(group);
    
    // ClothingModel의 private 속성에 접근할 수 없으므로
    // 임시로 public 메서드를 통해 처리하거나
    // 테스트용 코드이므로 직접 조작
    
    console.log('테스트 모델 생성 완료');
    
    // TODO: 실제 구현시 아래 코드로 교체
     await this.clothingModel.loadModel('/assets/models/sh.glb');
  }

  private showSizeRecommendation(): void {
    // 사이즈 추천 결과 표시
    this.sizeRecommender.showRecommendation();
  }
}

// 앱 시작
console.log('앱 로딩 시작...');
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM 로드 완료, 앱 초기화...');
  new ARFittingApp();
});