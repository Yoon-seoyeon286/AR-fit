import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { UserBodyData } from '../ui/BodyTypeSelector';

export class ClothingModel {
  private model: THREE.Group | null = null;
  private bones: Map<string, THREE.Bone> = new Map();
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private renderer: THREE.WebGLRenderer;
  
  // 옷의 위치와 회전
  private position: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private rotation: THREE.Euler = new THREE.Euler(0, 0, 0);
  private userScale: number = 1; // 사용자가 조절하는 스케일
  private baseScale: number = 1; // 체형에 따른 기본 스케일
  
  // 드래그 관련
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private mouse: THREE.Vector2 = new THREE.Vector2();
  private isDragging: boolean = false;
  private dragPlane: THREE.Plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  private offset: THREE.Vector3 = new THREE.Vector3();

  constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    
    this.setupDragControls();
  }

  private setupDragControls(): void {
    const canvas = this.renderer.domElement;
    
    // 터치 시작
    canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
    canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    
    // 터치 이동
    canvas.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
    canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    
    // 터치 종료
    canvas.addEventListener('touchend', () => this.onDragEnd());
    canvas.addEventListener('mouseup', () => this.onDragEnd());
  }

  private getPointerPosition(event: TouchEvent | MouseEvent): { x: number, y: number } {
    const canvas = this.renderer.domElement;
    const rect = canvas.getBoundingClientRect();
    
    let clientX: number;
    let clientY: number;
    
    if (event instanceof TouchEvent && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else if (event instanceof MouseEvent) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else {
      return { x: 0, y: 0 };
    }
    
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;
    
    return { x, y };
  }

  private onTouchStart(event: TouchEvent): void {
    event.preventDefault();
    const pos = this.getPointerPosition(event);
    this.startDrag(pos.x, pos.y);
  }

  private onMouseDown(event: MouseEvent): void {
    const pos = this.getPointerPosition(event);
    this.startDrag(pos.x, pos.y);
  }

  private startDrag(x: number, y: number): void {
    if (!this.model) return;
    
    this.mouse.set(x, y);
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    // 모델과 교차하는지 확인
    const intersects = this.raycaster.intersectObject(this.model, true);
    
    if (intersects.length > 0) {
      this.isDragging = true;
      
      // 드래그 평면을 카메라 앞에 설정
      const cameraDirection = new THREE.Vector3();
      this.camera.getWorldDirection(cameraDirection);
      this.dragPlane.setFromNormalAndCoplanarPoint(
        cameraDirection,
        this.model.position
      );
      
      // 현재 교차점과 모델 위치의 차이 저장
      const intersectPoint = new THREE.Vector3();
      this.raycaster.ray.intersectPlane(this.dragPlane, intersectPoint);
      this.offset.copy(intersectPoint).sub(this.model.position);
    }
  }

  private onTouchMove(event: TouchEvent): void {
    event.preventDefault();
    const pos = this.getPointerPosition(event);
    this.drag(pos.x, pos.y);
  }

  private onMouseMove(event: MouseEvent): void {
    const pos = this.getPointerPosition(event);
    this.drag(pos.x, pos.y);
  }

  private drag(x: number, y: number): void {
    if (!this.isDragging || !this.model) return;
    
    this.mouse.set(x, y);
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    // 드래그 평면과 교차점 찾기
    const intersectPoint = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(this.dragPlane, intersectPoint);
    
    // 새 위치 = 교차점 - offset
    this.model.position.copy(intersectPoint).sub(this.offset);
    this.position.copy(this.model.position);
  }

  private onDragEnd(): void {
    this.isDragging = false;
  }

  public async loadModel(modelPath: string): Promise<void> {
    const loader = new GLTFLoader();
    
    return new Promise((resolve, reject) => {
      loader.load(
        modelPath,
        (gltf) => {
          this.model = gltf.scene;
          
          // 모델의 초기 위치와 크기 설정
          this.model.position.copy(this.position);
          this.model.rotation.copy(this.rotation);
          
          // bone 찾기
          this.findBones(this.model);
          
          // 씬에 추가
          this.scene.add(this.model);
          
          console.log('모델 로드 완료');
          console.log('찾은 bone 개수:', this.bones.size);
          
          resolve();
        },
        (progress) => {
          const percent = (progress.loaded / progress.total) * 100;
          console.log(`로딩 중: ${percent.toFixed(2)}%`);
        },
        (error) => {
          console.error('모델 로드 오류:', error);
          reject(error);
        }
      );
    });
  }

  private findBones(object: THREE.Object3D): void {
    object.traverse((child) => {
      if (child instanceof THREE.Bone) {
        this.bones.set(child.name, child);
        console.log('Bone 발견:', child.name);
      }
    });
  }

  public applyBodyTypeScale(userData: UserBodyData): void {
    if (!this.model) {
      console.error('모델이 로드되지 않았습니다');
      return;
    }
    
    // 전체 스케일 저장
    this.baseScale = userData.overallScale;
    this.updateModelScale();
    
    // 각 bone별로 체형에 맞는 scale 적용
    const scales = userData.bodyTypeScale;
    
    this.scaleBone('shoulder_L', scales.shoulder, 1, 1);
    this.scaleBone('shoulder_R', scales.shoulder, 1, 1);
    this.scaleBone('chest', scales.chest, scales.chest, 1);
    this.scaleBone('waist', scales.waist, scales.waist, 1);
    this.scaleBone('hip', scales.hip, scales.hip, 1);
    this.scaleBone('arm_L', scales.arm, scales.arm, 1);
    this.scaleBone('arm_R', scales.arm, scales.arm, 1);
    
    console.log('체형 스케일 적용 완료');
  }

  private scaleBone(boneName: string, scaleX: number, scaleY: number, scaleZ: number): void {
    const bone = this.bones.get(boneName);
    if (bone) {
      bone.scale.set(scaleX, scaleY, scaleZ);
    } else {
      console.warn(`Bone '${boneName}'을 찾을 수 없습니다`);
    }
  }

  public setUserScale(scale: number): void {
    this.userScale = scale;
    this.updateModelScale();
  }

  private updateModelScale(): void {
    if (this.model) {
      const finalScale = this.baseScale * this.userScale;
      this.model.scale.set(finalScale, finalScale, finalScale);
    }
  }

  public moveUp(amount: number = 0.1): void {
    if (this.model) {
      this.position.y += amount;
      this.model.position.y = this.position.y;
    }
  }

  public moveDown(amount: number = 0.1): void {
    if (this.model) {
      this.position.y -= amount;
      this.model.position.y = this.position.y;
    }
  }

  public rotateLeft(amount: number = 0.1): void {
    if (this.model) {
      this.rotation.y += amount;
      this.model.rotation.y = this.rotation.y;
    }
  }

  public rotateRight(amount: number = 0.1): void {
    if (this.model) {
      this.rotation.y -= amount;
      this.model.rotation.y = this.rotation.y;
    }
  }

  public getModel(): THREE.Group | null {
    return this.model;
  }

  public remove(): void {
    if (this.model) {
      this.scene.remove(this.model);
      this.model = null;
      this.bones.clear();
    }
  }
}