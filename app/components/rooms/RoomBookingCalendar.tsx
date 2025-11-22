import { Box, Button, Text } from "@chakra-ui/react";
import { DayPicker, type DateRange } from "react-day-picker";
import { startOfToday, addMonths, isBefore } from "date-fns";
import { useState, useEffect } from "react";
import { checkBooking, createBooking } from "~/utils/api";
import { parseApiError } from "~/utils/error";
import { formatDate } from "~/utils/date";
import { toaster } from "~/components/ui/toaster";
import "react-day-picker/dist/style.css";

interface RoomBookingCalendarProps {
    roomPk: number;
}

export function RoomBookingCalendar({ roomPk }: RoomBookingCalendarProps) {
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [checkBookingData, setCheckBookingData] = useState<{ available: boolean; message: string } | null>(null);
    const [isCheckingBooking, setIsCheckingBooking] = useState(false);
    const [isCreatingBooking, setIsCreatingBooking] = useState(false);

    const handleDateRangeChange = (range: DateRange | undefined) => {
        setDateRange(range);
        setCheckBookingData(null); // 날짜 변경 시 이전 결과 초기화
    };

    const handleBookingClick = async () => {
        if (!dateRange?.from || !dateRange?.to) {
            return;
        }

        const checkIn = formatDate(dateRange.from);
        const checkOut = formatDate(dateRange.to);

        setIsCreatingBooking(true);
        try {
            await createBooking(roomPk, checkIn, checkOut);
            toaster.create({
                title: "Booking successful!",
                description: "Your booking has been confirmed.",
                type: "success",
                duration: 5000,
            });
            // 예약 성공 후 날짜 초기화
            setDateRange(undefined);
            setCheckBookingData(null);
        } catch (error) {
            const errorMessage = parseApiError(error, "Failed to create booking. Please try again.");
            toaster.create({
                title: "Booking failed",
                description: errorMessage,
                type: "error",
                duration: 5000,
            });
        } finally {
            setIsCreatingBooking(false);
        }
    };

    // Check booking availability when date range is selected
    useEffect(() => {
        if (dateRange?.from && dateRange?.to) {
            const checkIn = formatDate(dateRange.from);
            const checkOut = formatDate(dateRange.to);

            setIsCheckingBooking(true);
            checkBooking(roomPk, checkIn, checkOut)
                .then((data) => {
                    console.log("Booking check response:", data);
                    setCheckBookingData(data);
                })
                .catch((error) => {
                    console.error("Failed to check booking:", error);
                    setCheckBookingData({ available: false, message: "Failed to check booking availability." });
                })
                .finally(() => {
                    setIsCheckingBooking(false);
                });
        } else {
            setCheckBookingData(null);
        }
    }, [dateRange, roomPk]);

    return (
        <Box pt={{ base: 0, md: 10 }}>
            <DayPicker
                mode="range"
                selected={dateRange}
                onSelect={handleDateRangeChange}
                numberOfMonths={2}
                fromDate={startOfToday()}
                toDate={addMonths(startOfToday(), 6)}
                disabled={(date) => isBefore(date, startOfToday())}
                className="chakra-day-picker"
            />
            <Button
                disabled={!dateRange?.from || !dateRange?.to || !checkBookingData?.available || isCreatingBooking}
                loading={isCreatingBooking}
                onClick={handleBookingClick}
                mt={5}
                w="100%"
                colorPalette="red"
            >
                Make booking
            </Button>
            {!isCheckingBooking && checkBookingData && !checkBookingData.available && (
                <Text color="red.500" mt={2}>
                    {checkBookingData.message || "Can't book on those dates, sorry."}
                </Text>
            )}
        </Box>
    );
}

