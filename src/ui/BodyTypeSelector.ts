import { bodyTypes, calculateOverallScale } from '../data/bodyTypes';

export interface UserBodyData {
  height: number;
  weight: number;
  bodyType: string;
  overallScale: number;
  bodyTypeScale: any;
}

export class BodyTypeSelector {
  private heightInput: HTMLInputElement;
  private weightInput: HTMLInputElement;
  private bodyTypeButtons: NodeListOf<HTMLButtonElement>;
  private startButton: HTMLButtonElement;
  private panel: HTMLElement;
  
  private selectedBodyType: string | null = null;
  private onStartCallback: ((data: UserBodyData) => void) | null = null;

  constructor() {
    // HTML 요소들을 가져옵니다
    this.heightInput = document.getElementById('height') as HTMLInputElement;
    this.weightInput = document.getElementById('weight') as HTMLInputElement;
    this.bodyTypeButtons = document.querySelectorAll('.body-type-btn');
    this.startButton = document.getElementById('start-btn') as HTMLButtonElement;
    this.panel = document.getElementById('body-type-panel') as HTMLElement;

    console.log('BodyTypeSelector 초기화:', {
      heightInput: this.heightInput,
      weightInput: this.weightInput,
      bodyTypeButtons: this.bodyTypeButtons.length,
      startButton: this.startButton,
      panel: this.panel
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // 키, 몸무게 입력시 유효성 검사
    const validateHandler = () => {
      console.log('입력 변경 감지');
      this.validateInputs();
    };

    this.heightInput.addEventListener('input', validateHandler);
    this.heightInput.addEventListener('change', validateHandler);
    this.weightInput.addEventListener('input', validateHandler);
    this.weightInput.addEventListener('change', validateHandler);

    // 체형 버튼 클릭 이벤트 (pointer events 사용)
    this.bodyTypeButtons.forEach(button => {
      button.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        const bodyType = button.getAttribute('data-type');
        console.log('체형 선택:', bodyType);
        if (bodyType) {
          this.selectBodyType(bodyType);
        }
      });
    });

    // 시작 버튼
    this.startButton.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      console.log('시작 버튼 클릭됨, disabled:', this.startButton.disabled);
      if (!this.startButton.disabled) {
        this.startARFitting();
      }
    });
  }

  private selectBodyType(bodyType: string): void {
    // 이전 선택 해제
    this.bodyTypeButtons.forEach(btn => btn.classList.remove('selected'));
    
    // 새로운 선택
    const selectedButton = document.querySelector(`[data-type="${bodyType}"]`);
    if (selectedButton) {
      selectedButton.classList.add('selected');
      this.selectedBodyType = bodyType;
      this.validateInputs();
    }
  }

  private validateInputs(): void {
    // 모든 입력이 유효한지 확인
    const height = parseFloat(this.heightInput.value);
    const weight = parseFloat(this.weightInput.value);

    const isHeightValid = !isNaN(height) && height >= 100 && height <= 250;
    const isWeightValid = !isNaN(weight) && weight >= 30 && weight <= 200;
    const isBodyTypeSelected = this.selectedBodyType !== null;

    console.log('유효성 검사:', { height, weight, bodyType: this.selectedBodyType, isHeightValid, isWeightValid, isBodyTypeSelected });

    // 모든 조건이 만족되면 시작 버튼 활성화
    if (isHeightValid && isWeightValid && isBodyTypeSelected) {
      this.startButton.disabled = false;
      console.log('버튼 활성화됨');
    } else {
      this.startButton.disabled = true;
    }
  }

  private startARFitting(): void {
    const height = parseFloat(this.heightInput.value);
    const weight = parseFloat(this.weightInput.value);
    
    if (!this.selectedBodyType) return;
    
    // 전체 스케일 계산
    const overallScale = calculateOverallScale(height, weight);
    
    // 선택된 체형의 비율 가져오기
    const bodyTypeScale = bodyTypes[this.selectedBodyType].scale;
    
    // 사용자 데이터 객체 생성
    const userData: UserBodyData = {
      height,
      weight,
      bodyType: this.selectedBodyType,
      overallScale,
      bodyTypeScale
    };
    
    // 패널 숨기기
    this.hidePanel();
    
    // 콜백 실행
    if (this.onStartCallback) {
      this.onStartCallback(userData);
    }
  }

  public onStart(callback: (data: UserBodyData) => void): void {
    this.onStartCallback = callback;
  }

  public hidePanel(): void {
    this.panel.classList.add('hidden');
  }

  public showPanel(): void {
    this.panel.classList.remove('hidden');
  }
}