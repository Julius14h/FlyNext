export type Params<T> = {params: Promise<T>}
export type IDParam = Params<{id: string}>
export type HotelIDParam = Params<{hotelID: string}>