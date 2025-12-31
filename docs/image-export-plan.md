# 이미지 내보내기 기능 구현 계획

## 목표
사용자가 픽셀 아트를 PNG 이미지로 내보내서 다운로드할 수 있도록 하기

## 현재 상태
- 기본 캔버스 그리기 기능 구현됨
- Zustand로 상태 관리
- 헤더에 "Export PNG" 버튼이 있지만 기능 없음 (app/page.tsx:19-21)

## 구현 단계

### 1단계: 이미지 내보내기 유틸리티 함수 만들기

**파일 위치**: `lib/exportImage.ts` (새로 생성)

**필요한 기능**:
```typescript
interface ExportOptions {
  includeGrid?: boolean;    // 그리드 포함 여부
  scale?: number;            // 이미지 크기 배율 (1, 2, 4, 8 등)
  filename?: string;         // 다운로드 파일명
}

// Canvas 데이터를 이미지로 변환하여 다운로드
export function exportCanvasAsImage(
  canvas: Canvas,
  width: number,
  height: number,
  pixelSize: number,
  options: ExportOptions
): void
```

**구현 힌트**:
1. 임시 canvas 엘리먼트를 만들기 (`document.createElement('canvas')`)
2. 2D context 가져오기
3. Canvas 데이터를 순회하며 픽셀 그리기
4. 옵션에 따라 그리드도 그리기
5. `canvas.toDataURL('image/png')`로 이미지 데이터 생성
6. `<a>` 태그 생성하여 다운로드 트리거

**참고 자료**:
- Canvas API: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- toDataURL: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL

---

### 2단계: Zustand 스토어에 export 함수 추가

**파일**: `store/useCanvasStore.ts`

**추가할 내용**:
```typescript
interface CanvasStore {
  // ... 기존 속성들
  exportImage: (options?: ExportOptions) => void;
}

// 구현부
exportImage: (options = {}) => {
  const { canvas, canvasWidth, canvasHeight, pixelSize } = get();
  exportCanvasAsImage(canvas, canvasWidth, canvasHeight, pixelSize, {
    scale: 1,
    includeGrid: false,
    filename: `PIXELKET-${Date.now()}.png`,
    ...options,
  });
},
```

---

### 3단계: Export PNG 버튼에 기능 연결

**파일**: `app/page.tsx`

**수정할 부분**: 19-21번 줄

**변경 전**:
```tsx
<button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
  Export PNG
</button>
```

**변경 후**:
```tsx
'use client' 추가 및 useCanvasStore import

const { exportImage } = useCanvasStore();

<button
  onClick={() => exportImage()}
  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
>
  Export PNG
</button>
```

---

### 4단계 (선택사항): 내보내기 옵션 UI 추가

**새 컴포넌트**: `components/ExportModal.tsx`

**기능**:
- 그리드 포함/제외 체크박스
- 스케일 선택 (1x, 2x, 4x, 8x)
- Export 버튼

**사용 라이브러리 고려**:
- 모달 UI는 Tailwind CSS만으로도 구현 가능
- 또는 headlessui, radix-ui 같은 라이브러리 사용 가능

**UI 플로우**:
1. "Export PNG" 버튼 클릭 → 모달 열림
2. 옵션 선택
3. "Download" 버튼 클릭 → 이미지 다운로드

---

## 체크리스트

### 기본 기능
- [ ] `lib/exportImage.ts` 파일 생성
- [ ] `exportCanvasAsImage` 함수 구현
- [ ] 스토어에 `exportImage` 함수 추가
- [ ] Export PNG 버튼에 onClick 핸들러 연결
- [ ] 다운로드 테스트

### 고급 기능 (선택사항)
- [ ] 그리드 포함/제외 옵션 구현
- [ ] 이미지 스케일링 옵션 구현
- [ ] ExportModal 컴포넌트 생성
- [ ] 파일명 커스터마이징 옵션

---

## 테스트 시나리오

1. **기본 내보내기**
   - 픽셀 아트 그리기
   - Export PNG 버튼 클릭
   - PNG 파일이 다운로드되는지 확인
   - 이미지 뷰어로 열어서 정상적으로 보이는지 확인

2. **빈 캔버스 내보내기**
   - 아무것도 그리지 않은 상태에서 내보내기
   - 투명한 PNG가 생성되는지 확인

3. **다양한 색상 테스트**
   - 여러 색상으로 그린 후 내보내기
   - 색상이 정확히 재현되는지 확인

4. **스케일링 테스트** (구현 시)
   - 1x, 2x, 4x 등 다양한 스케일로 내보내기
   - 픽셀이 깨지지 않고 선명하게 확대되는지 확인

---

## 참고 코드 구조

```
PIXELKET/
├── app/
│   └── page.tsx (Export 버튼)
├── components/
│   ├── Canvas.tsx
│   ├── Toolbar.tsx
│   ├── ColorPicker.tsx
│   └── ExportModal.tsx (새로 생성 - 선택사항)
├── lib/
│   └── exportImage.ts (새로 생성)
├── store/
│   └── useCanvasStore.ts (수정)
└── types/
    └── index.ts (ExportOptions 타입 추가)
```

---

## 추가 아이디어

### 다른 포맷 지원
- JPEG 내보내기
- SVG 내보내기 (벡터 형식)
- GIF 애니메이션 (프레임 기반)

### 공유 기능
- 클립보드에 복사
- 소셜 미디어 공유

### 프리셋
- 특정 플랫폼용 크기 (트위터 배너, 아이콘 등)
- 자주 사용하는 설정 저장

---

## 도움이 필요할 때

1. **Canvas API 사용법이 헷갈릴 때**
   - MDN 문서 참고
   - 기존 `components/Canvas.tsx` 참고

2. **Zustand 스토어 수정 방법**
   - 기존 `store/useCanvasStore.ts`의 다른 함수들 참고
   - set, get 사용법

3. **TypeScript 타입 에러**
   - `types/index.ts` 확인
   - 필요시 새로운 타입 정의

막히는 부분 있으면 언제든지 물어보세요.
