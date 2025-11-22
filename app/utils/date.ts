/**
 * 날짜를 YYYY-MM-DD 형식의 문자열로 변환합니다.
 * 타임존 문제를 방지하기 위해 로컬 날짜를 직접 포맷팅합니다.
 * @param date 변환할 Date 객체
 * @returns YYYY-MM-DD 형식의 문자열 (예: "2025-11-22")
 */
export function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

/**
 * 날짜를 "몇년몇월몇일 오후/오전 시" 형식으로 변환합니다.
 * @param date 변환할 Date 객체
 * @param hour 시간 (기본값: 체크인은 14시, 체크아웃은 11시)
 * @returns 포맷된 날짜 문자열 (예: "2025년 11월 22일 오후 2시")
 */
export function formatBookingDate(date: Date, hour: number = 14): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const period = hour >= 12 ? "오후" : "오전";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;

    return `${year}년 ${month}월 ${day}일 ${period} ${displayHour}시`;
}

