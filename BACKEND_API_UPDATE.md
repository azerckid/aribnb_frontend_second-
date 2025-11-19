# 방 업로드 API 업데이트 요청

## 변경사항 요약

기존 `/rooms/` POST API에 **2개의 필드만 추가**하면 됩니다.

## 추가할 필드

### 1. `category` (카테고리)
- **타입**: `number` (카테고리 ID)
- **필수**: Yes
- **설명**: 카테고리의 primary key 값
- **예시**: `1`, `2`, `3` 등

### 2. `amenities` (편의시설)
- **타입**: `number[]` (편의시설 ID 배열)
- **필수**: No (빈 배열 `[]` 가능)
- **설명**: 선택된 편의시설들의 primary key 값들의 배열
- **예시**: `[1, 2, 3]`, `[]` (선택 안 함)

## 요청 예시

```json
{
  "name": "Cozy Apartment",
  "country": "South Korea",
  "city": "Seoul",
  "address": "123 Gangnam-gu",
  "price": 100000,
  "rooms": 2,
  "toilets": 1,
  "beds": 2,
  "description": "Beautiful apartment with modern amenities.",
  "pet_friendly": true,
  "kind": "entire_place",
  "category": 1,           // ← 새로 추가
  "amenities": [1, 2, 3]  // ← 새로 추가
}
```

## Django 모델 수정

```python
class Room(models.Model):
    # ... 기존 필드들 ...
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    amenities = models.ManyToManyField(Amenity, blank=True)
```

## Django Serializer 수정

```python
class RoomSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        required=True  # 필수 필드
    )
    amenities = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Amenity.objects.all(),
        required=False  # 선택 필드
    )
    
    class Meta:
        model = Room
        fields = [
            # ... 기존 필드들 ...
            'category',  # 추가
            'amenities', # 추가
        ]
    
    def create(self, validated_data):
        amenities = validated_data.pop('amenities', [])
        room = Room.objects.create(**validated_data)
        room.amenities.set(amenities)  # ManyToMany 관계 설정
        return room
```

## 참고: 카테고리/편의시설 조회 API

프론트엔드에서 이미 사용 중인 API들:

- **카테고리 목록**: `GET /categories`
  - 응답 형식: Django REST Framework paginated response
  - 각 항목에 `pk` 필드 필요
  
- **편의시설 목록**: `GET /rooms/amenities`
  - 응답 형식: 배열
  - 각 항목에 `pk` 필드 필요

## 체크리스트

- [ ] Room 모델에 `category` ForeignKey 추가
- [ ] Room 모델에 `amenities` ManyToManyField 추가
- [ ] Serializer에 `category`, `amenities` 필드 추가
- [ ] `create` 메서드에서 `amenities` ManyToMany 관계 설정
- [ ] 카테고리/편의시설 조회 API 응답에 `pk` 필드 포함 확인

