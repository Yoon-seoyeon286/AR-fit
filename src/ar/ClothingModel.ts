import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { UserBodyData } from '../ui/BodyTypeSelector';

export class ClothingModel {
  private model: THREE.Group | null = null;
  private bones: Map<string, THREE.Bone> = new Map();
  private scene: THREE.Scene;
  
  // 옷의 위치와 회전
  private position: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private rotation: THREE.Euler = new THREE.Euler(0, 0, 0);

  constructor(scene: THREE.Scene) {
    this.scene = scene;
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
          
          // bone 찾기 (Blender에서 만든 Armature의 bone들)
          this.findBones(this.model);
          
          // 씬에 추가
          this.scene.add(this.model);
          
          console.log('모델 로드 완료');
          console.log('찾은 bone 개수:', this.bones.size);
          
          resolve();
        },
        (progress) => {
          // 로딩 진행률
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
    // 모델 내의 모든 bone을 찾아서 저장
    object.traverse((child) => {
      if (child instanceof THREE.Bone) {
        // bone 이름으로 저장 (Blender에서 지정한 이름)
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
    
    // 전체 스케일 적용
    const baseScale = userData.overallScale;
    this.model.scale.set(baseScale, baseScale, baseScale);
    
    // 각 bone별로 체형에 맞는 scale 적용
    const scales = userData.bodyTypeScale;
    
    // bone 이름은 Blender에서 설정한 이름과 일치해야 합니다
    // 예시 bone 이름들:
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
      // bone이 없어도 오류는 내지 않음 (모델에 해당 bone이 없을 수 있음)
      console.warn(`Bone '${boneName}'을 찾을 수 없습니다`);
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