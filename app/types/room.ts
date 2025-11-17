export interface IPhoto {
    pk: string;
    file: string;
    description: string;
}

export interface IRoom {
    pk: number;
    name: string;
    country: string;
    city: string;
    price: number;
    rating: number;
    is_owner: boolean;
    photos: IPhoto[];
}

