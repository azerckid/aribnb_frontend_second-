# 방 업로드 API 스펙

## 엔드포인트
```
POST /rooms/
```

## 요청 헤더
```
Content-Type: application/json
X-CSRFToken: {csrf_token}  # CSRF 보호가 활성화된 경우
Cookie: {session_cookie}   # 인증 쿠키
```

## 요청 본문 (JSON)

### 필수 필드

| 필드명 | 타입 | 설명 | 제약사항 |
|--------|------|------|----------|
| `name` | string | 방 이름 | 최소 2자 이상 |
| `country` | string | 국가 | 필수 |
| `city` | string | 도시 | 필수 |
| `address` | string | 주소 | 필수 |
| `price` | number | 가격 | 0보다 큰 숫자 |
| `rooms` | number | 방 개수 | 0 이상의 숫자 |
| `toilets` | number | 화장실 개수 | 0 이상의 숫자 |
| `beds` | number | 침대 개수 | 0 이상의 숫자 |
| `description` | string | 방 설명 | 최소 10자 이상 |
| `pet_friendly` | boolean | 반려동물 허용 여부 | true/false |
| `kind` | string | 방 종류 | `"entire_place"`, `"private_room"`, `"shared_room"` 중 하나 |
| `category` | number | 카테고리 ID | 양수 (카테고리의 pk 값) |
| `amenities` | number[] | 편의시설 ID 배열 | 배열 (편의시설의 pk 값들) |

### 요청 예시

```json
{
  "name": "Cozy Apartment in Downtown",
  "country": "South Korea",
  "city": "Seoul",
  "address": "123 Gangnam-gu, Seoul",
  "price": 100000,
  "rooms": 2,
  "toilets": 1,
  "beds": 2,
  "description": "Beautiful apartment in the heart of Seoul with modern amenities.",
  "pet_friendly": true,
  "kind": "entire_place",
  "category": 1,
  "amenities": [1, 2, 3, 5]
}
```

## 응답

### 성공 응답 (201 Created)

```json
{
  "id": 123,
  "pk": 123,
  "name": "Cozy Apartment in Downtown",
  "country": "South Korea",
  "city": "Seoul",
  "address": "123 Gangnam-gu, Seoul",
  "price": 100000,
  "rooms": 2,
  "toilets": 1,
  "beds": 2,
  "description": "Beautiful apartment in the heart of Seoul with modern amenities.",
  "pet_friendly": true,
  "kind": "entire_place",
  "category": {
    "pk": 1,
    "name": "Luxury Stays",
    "kind": "rooms"
  },
  "amenities": [
    {
      "pk": 1,
      "name": "Wi-Fi",
      "description": "High-speed wireless internet"
    },
    {
      "pk": 2,
      "name": "Parking",
      "description": "On-site secure parking"
    }
  ],
  "rating": 0,
  "is_owner": true,
  "is_liked": false,
  "photos": [],
  "owner": {
    "name": "John Doe",
    "avatar": "https://example.com/avatar.jpg",
    "username": "johndoe"
  },
  "created_at": "2025-01-20T10:00:00Z",
  "updated_at": "2025-01-20T10:00:00Z"
}
```

### 에러 응답

#### 400 Bad Request (Validation Error)
```json
{
  "field_name": ["Error message"],
  "another_field": ["Another error message"]
}
```

#### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

#### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

## 참고사항

### 1. 카테고리 (Category)
- `category` 필드는 카테고리의 `pk` (primary key) 값을 전달합니다.
- 카테고리 목록은 `GET /categories` 엔드포인트에서 조회할 수 있습니다.
- 응답 형식은 Django REST Framework의 paginated response입니다:
  ```json
  {
    "count": 7,
    "next": null,
    "previous": null,
    "results": [
      {
        "pk": 1,
        "name": "Luxury Stays",
        "kind": "rooms"
      },
      ...
    ]
  }
  ```

### 2. 편의시설 (Amenities)
- `amenities` 필드는 편의시설의 `pk` 값들의 배열을 전달합니다.
- 편의시설 목록은 `GET /rooms/amenities` 엔드포인트에서 조회할 수 있습니다.
- 빈 배열 `[]`을 전달할 수 있습니다 (편의시설 선택 안 함).

### 3. 방 종류 (Kind)
- 다음 세 가지 값 중 하나만 허용됩니다:
  - `"entire_place"`: 전체 공간
  - `"private_room"`: 개인실
  - `"shared_room"`: 공유실

### 4. 인증
- 방 업로드는 호스트 권한이 필요합니다.
- 인증은 쿠키 기반 세션 인증을 사용합니다.
- CSRF 보호가 활성화된 경우 `X-CSRFToken` 헤더가 필요합니다.

## Django 모델 예시

```python
class Room(models.Model):
    name = models.CharField(max_length=140)
    country = models.CharField(max_length=50)
    city = models.CharField(max_length=80)
    address = models.CharField(max_length=250)
    price = models.IntegerField()
    rooms = models.IntegerField()
    toilets = models.IntegerField()
    beds = models.IntegerField()
    description = models.TextField()
    pet_friendly = models.BooleanField(default=False)
    kind = models.CharField(
        max_length=20,
        choices=[
            ("entire_place", "Entire Place"),
            ("private_room", "Private Room"),
            ("shared_room", "Shared Room"),
        ]
    )
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    amenities = models.ManyToManyField(Amenity, blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

## Django Serializer 예시

```python
class RoomSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    amenities = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Amenity.objects.all(),
        required=False
    )
    
    class Meta:
        model = Room
        fields = [
            'id', 'pk', 'name', 'country', 'city', 'address',
            'price', 'rooms', 'toilets', 'beds', 'description',
            'pet_friendly', 'kind', 'category', 'amenities',
            'rating', 'is_owner', 'is_liked', 'photos', 'owner',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'pk', 'rating', 'is_owner', 'is_liked', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        amenities = validated_data.pop('amenities', [])
        room = Room.objects.create(**validated_data)
        room.amenities.set(amenities)
        return room
```

## Django ViewSet 예시

```python
class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Room.objects.all()
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
```

