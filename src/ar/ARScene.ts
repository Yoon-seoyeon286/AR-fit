import * as THREE from 'three';

export class ARScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private videoElement: HTMLVideoElement;
  private cameraStream: MediaStream | null = null;
  
  private animationFrameId: number | null = null;

  constructor() {
    // Three.js 씬 생성
    this.scene = new THREE.Scene();
    
    // 카메라 설정
    this.camera = new THREE.PerspectiveCamera(
      75, // 시야각
      window.innerWidth / window.innerHeight, // 종횡비
      0.1, // near plane
      1000 // far plane
    );
    this.camera.position.z = 5;
    
    // 렌더러 생성
    this.renderer = new THREE.WebGLRenderer({ 
      alpha: true, // 투명 배경
      antialias: true // 안티앨리어싱
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    
    // 비디오 엘리먼트 가져오기
    this.videoElement = document.getElementById('camera-feed') as HTMLVideoElement;
    
    // 캔버스를 DOM에 추가
    const container = document.getElementById('canvas-container');
    if (container) {
      container.appendChild(this.renderer.domElement);
    }
    
    // 조명 추가
    this.setupLights();
    
    // 창 크기 변경 이벤트
    window.addEventListener('resize', () => this.onWindowResize());
  }

  private setupLights(): void {
    // 환경광 (전체적으로 밝게)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    
    // 방향광 (그림자와 입체감)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(directionalLight);
    
    // 추가 방향광 (반대편에서)
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-1, -1, -1);
    this.scene.add(directionalLight2);
  }

  public async startCamera(): Promise<void> {
    try {
      // 후면 카메라 사용
      const constraints = {
        video: {
          facingMode: { exact: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      try {
        // 먼저 후면 카메라 시도
        this.cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch {
        // 후면 카메라 실패시 기본 카메라 사용
        console.log('후면 카메라 없음, 기본 카메라 사용');
        this.cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
      }

      // 비디오 엘리먼트에 스트림 연결
      this.videoElement.srcObject = this.cameraStream;

      console.log('카메라 시작 완료');
    } catch (error) {
      console.error('카메라 접근 오류:', error);
      alert('카메라에 접근할 수 없습니다. 권한을 확인해주세요.');
    }
  }

  public stopCamera(): void {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => track.stop());
      this.cameraStream = null;
    }
  }

  private onWindowResize(): void {
    // 창 크기가 바뀔 때 카메라와 렌더러 업데이트
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  public startRenderLoop(): void {
    // 렌더링 루프 시작
    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  public stopRenderLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public getScene(): THREE.Scene {
    return this.scene;
  }

  public getCamera(): THREE.Camera {
    return this.camera;
  }

  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }
}