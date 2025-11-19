# 카테고리 API 응답에 pk 필드 추가 요청

## 문제

프론트엔드에서 카테고리 선택 시 validation 에러가 발생합니다.

**원인:**
- 카테고리 API (`GET /categories`) 응답에 `pk` 필드가 없음
- 현재 응답: `{ name: "Luxury Stays", kind: "rooms" }`
- 필요한 응답: `{ pk: 1, name: "Luxury Stays", kind: "rooms" }`

## 현재 상황

프론트엔드 코드에서:
```typescript
<option value={category.pk || category.name}>
```

`pk`가 없으면 `category.name`이 value로 전달되고, validation에서 숫자 변환이 실패합니다.

## 해결 방법

### 백엔드 수정 필요

카테고리 API 응답에 `pk` 필드를 포함하도록 Serializer 수정:

```python
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['pk', 'name', 'kind']  # pk 필드 명시
```

또는:

```python
class CategorySerializer(serializers.ModelSerializer):
    pk = serializers.IntegerField(read_only=True)  # 명시적으로 추가
    
    class Meta:
        model = Category
        fields = ['pk', 'name', 'kind']
```

## 임시 해결책

프론트엔드에서 임시로 인덱스를 사용하도록 수정했지만, 이는 올바른 해결책이 아닙니다.

**권장: 백엔드에서 `pk` 필드를 포함하도록 수정**

