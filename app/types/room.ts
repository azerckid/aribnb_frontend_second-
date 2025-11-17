export interface IPhoto {
    pk: string;
    file: string;
    description: string;
}

export interface IOwner {
    name: string;
    avatar: string;
    username: string;
}

export interface IAmenity {
    name: string;
    description: string;
}

export interface ICategory {
    name: string;
    kind: string;
}

export interface IReview {
    user: IOwner;
    payload: string;
    rating: number;
    created_at?: string;
    updated_at?: string;
}

export interface IRoom {
    id: number;
    pk?: number; // 하위 호환성을 위해 유지
    name: string;
    country: string;
    city: string;
    price: number;
    rating: number;
    is_owner: boolean;
    is_liked: boolean;
    photos: IPhoto[];
    owner: IOwner;
    amenities: IAmenity[];
    category: ICategory;
    beds: unknown[];
    rooms: number;
    toilets: number;
    description: string;
    address: string;
    pet_friendly: boolean;
    kind: string;
    created_at: string;
    updated_at: string;
}
