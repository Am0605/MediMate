import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { View } from '@/components/Themed';
import { Calendar as RNCalendar, LocaleConfig } from 'react-native-calendars';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Appointment } from '@/types/calendar';

// Configure calendar locale
LocaleConfig.locales['en'] = {
  monthNames: [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ],
  monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};
LocaleConfig.defaultLocale = 'en';

type CalendarViewProps = {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  appointments: Appointment[];
};

export default function CalendarView({ selectedDate, setSelectedDate, appointments }: CalendarViewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Process appointments to mark dates on the calendar
  const markedDates = useMemo(() => {
    const dates: any = {};
    
    // Mark the selected date
    dates[selectedDate] = {
      selected: true,
      selectedColor: Colors[colorScheme].tint,
    };
    
    // Mark dates with appointments
    appointments.forEach(appointment => {
      if (dates[appointment.date]) {
        // If date already marked (including selected date)
        if (appointment.date === selectedDate) {
          dates[appointment.date] = {
            ...dates[appointment.date],
            marked: true,
            dotColor: '#FF3B30',
          };
        } else {
          dates[appointment.date] = {
            ...dates[appointment.date],
            marked: true,
            dotColor: Colors[colorScheme].tint,
          };
        }
      } else {
        // New date with appointment
        dates[appointment.date] = {
          marked: true,
          dotColor: Colors[colorScheme].tint,
        };
      }
    });
    
    return dates;
  }, [appointments, selectedDate, colorScheme]);

  // Generate calendar theme based on app theme
  const calendarTheme = {
    backgroundColor: 'transparent',
    calendarBackground: 'transparent',
    textSectionTitleColor: Colors[colorScheme].text,
    selectedDayBackgroundColor: Colors[colorScheme].tint,
    selectedDayTextColor: '#ffffff',
    todayTextColor: Colors[colorScheme].tint,
    dayTextColor: Colors[colorScheme].text,
    textDisabledColor: isDark ? '#555555' : '#d9e1e8',
    dotColor: Colors[colorScheme].tint,
    selectedDotColor: '#ffffff',
    arrowColor: Colors[colorScheme].tint,
    monthTextColor: Colors[colorScheme].text,
    indicatorColor: Colors[colorScheme].tint,
    textDayFontWeight: '300',
    textMonthFontWeight: 'bold',
    textDayHeaderFontWeight: '300',
    textDayFontSize: 16,
    textMonthFontSize: 16,
    textDayHeaderFontSize: 14
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].card }]}>
      <RNCalendar
        markedDates={markedDates}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        theme={calendarTheme}
        enableSwipeMonths
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    margin: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
});