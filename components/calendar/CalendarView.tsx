import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { View } from '@/components/Themed';
import { Calendar as RNCalendar, LocaleConfig } from 'react-native-calendars';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { AppointmentDisplay } from '@/types/calendar'; // Changed from Appointment

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
  appointments: AppointmentDisplay[]; // Changed type
  loading?: boolean;
};

export default function CalendarView({ 
  selectedDate, 
  setSelectedDate, 
  appointments,
  loading = false 
}: CalendarViewProps) {
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
      const appointmentDate = appointment.date; // Now this exists in AppointmentDisplay
      
      if (!appointmentDate) return; // Skip if no date
      
      if (dates[appointmentDate]) {
        // If date already marked (including selected date)
        if (appointmentDate === selectedDate) {
          dates[appointmentDate] = {
            ...dates[appointmentDate],
            marked: true,
            dotColor: '#FF3B30', // Red dot for selected date with appointments
          };
        } else {
          dates[appointmentDate] = {
            ...dates[appointmentDate],
            marked: true,
            dotColor: Colors[colorScheme].tint,
          };
        }
      } else {
        // New date with appointment
        dates[appointmentDate] = {
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
    textDayFontSize: 16,
    textMonthFontSize: 18,
    textDayHeaderFontSize: 14,
    'stylesheet.calendar.header': {
      week: {
        marginTop: 5,
        flexDirection: 'row',
        justifyContent: 'space-around',
      },
    },
  };

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: Colors[colorScheme].card,
        opacity: loading ? 0.7 : 1 
      }
    ]}>
      <RNCalendar
        markedDates={markedDates}
        onDayPress={(day) => {
          if (!loading) {
            setSelectedDate(day.dateString);
          }
        }}
        theme={calendarTheme}
        enableSwipeMonths={!loading}
        hideExtraDays={true}
        firstDay={1} // Start week on Monday
        showWeekNumbers={false}
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