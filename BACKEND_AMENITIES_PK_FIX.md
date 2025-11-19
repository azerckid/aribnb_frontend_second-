# 편의시설 API 응답에 pk 필드 추가 요청

## 문제

프론트엔드에서 편의시설 체크박스에 key prop 경고가 발생합니다.

**원인:**
- 편의시설 API (`GET /rooms/amenities`) 응답에 `pk` 필드가 없음
- 현재 응답: `{ name: "Wi-Fi", description: "High-speed wireless internet" }`
- 필요한 응답: `{ pk: 1, name: "Wi-Fi", description: "High-speed wireless internet" }`

## 현재 상황

프론트엔드 코드에서:
```typescript
{amenitiesArray.map((amenity) => (
    <Box key={amenity.pk}>  // pk가 없으면 key가 undefined
        <input value={amenity.pk} />  // pk가 없으면 value가 undefined
    </Box>
))}
```

`pk`가 없으면 React key prop 경고가 발생하고, 체크박스 value도 제대로 전달되지 않습니다.

## 해결 방법

### 백엔드 수정 필요

편의시설 API 응답에 `pk` 필드를 포함하도록 Serializer 수정:

```python
class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = ['pk', 'name', 'description']  # pk 필드 명시
```

또는:

```python
class AmenitySerializer(serializers.ModelSerializer):
    pk = serializers.IntegerField(read_only=True)  # 명시적으로 추가
    
    class Meta:
        model = Amenity
        fields = ['pk', 'name', 'description']
```

## 임시 해결책

프론트엔드에서 임시로 인덱스를 사용하도록 수정했지만, 이는 올바른 해결책이 아닙니다.

**권장: 백엔드에서 `pk` 필드를 포함하도록 수정**

## 참고

카테고리 API는 이미 `pk` 필드를 포함하도록 수정되었습니다. 편의시설 API도 동일하게 수정이 필요합니다.

