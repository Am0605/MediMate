import React, { useState, useCallback, useMemo } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  ActivityIndicator, 
  Modal,
  TextInput,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar as RNCalendar, LocaleConfig } from 'react-native-calendars';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width: screenWidth } = Dimensions.get('window');

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

// Mock appointment data
const initialAppointments = [
  {
    id: '1',
    title: 'Dr. Johnson - Annual Checkup',
    date: '2025-06-05',
    time: '09:30',
    location: 'City Medical Center',
    doctorName: 'Dr. Sarah Johnson',
    doctorSpecialty: 'Primary Care Physician',
    notes: 'Bring insurance card and list of current medications'
  },
  {
    id: '2',
    title: 'Dr. Lee - Dental Cleaning',
    date: '2025-06-10',
    time: '14:00',
    location: 'Smile Dental Clinic',
    doctorName: 'Dr. Michael Lee',
    doctorSpecialty: 'Dentist',
    notes: 'Schedule six-month follow-up appointment'
  },
  {
    id: '3',
    title: 'Dr. Patel - Eye Exam',
    date: '2025-06-15',
    time: '11:15',
    location: 'Clear Vision Eye Care',
    doctorName: 'Dr. Anita Patel',
    doctorSpecialty: 'Optometrist',
    notes: 'Bring current glasses/contacts'
  }
];

type Appointment = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  doctorName: string;
  doctorSpecialty: string;
  notes: string;
};

export default function Calendar() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  
  // Form fields for new/edit appointment
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState(new Date());
  const [formTime, setFormTime] = useState(new Date());
  const [formLocation, setFormLocation] = useState('');
  const [formDoctorName, setFormDoctorName] = useState('');
  const [formDoctorSpecialty, setFormDoctorSpecialty] = useState('');
  const [formNotes, setFormNotes] = useState('');
  
  // Date/time picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
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
            dotColor: Colors[colorScheme].notification,
          };
        }
      } else {
        // New date with appointment
        dates[appointment.date] = {
          marked: true,
          dotColor: Colors[colorScheme].notification,
        };
      }
    });
    
    return dates;
  }, [appointments, selectedDate, colorScheme]);
  
  // Get appointments for the selected date
  const appointmentsForSelectedDate = useMemo(() => {
    return appointments.filter(appointment => appointment.date === selectedDate)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, selectedDate]);
  
  // Handle opening the add appointment modal
  const handleAddAppointment = () => {
    // Reset form fields
    setEditingAppointment(null);
    setFormTitle('');
    setFormDate(new Date());
    setFormTime(new Date());
    setFormLocation('');
    setFormDoctorName('');
    setFormDoctorSpecialty('');
    setFormNotes('');
    
    // Use selected date for new appointment
    const [year, month, day] = selectedDate.split('-').map(n => parseInt(n, 10));
    const selectedDateObj = new Date(year, month - 1, day);
    setFormDate(selectedDateObj);
    
    setModalVisible(true);
  };
  
  // Handle editing an existing appointment
  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    
    // Fill form with appointment data
    setFormTitle(appointment.title);
    
    // Parse date
    const [year, month, day] = appointment.date.split('-').map(n => parseInt(n, 10));
    const dateObj = new Date(year, month - 1, day);
    setFormDate(dateObj);
    
    // Parse time
    const [hours, minutes] = appointment.time.split(':').map(n => parseInt(n, 10));
    const timeObj = new Date();
    timeObj.setHours(hours, minutes, 0, 0);
    setFormTime(timeObj);
    
    setFormLocation(appointment.location);
    setFormDoctorName(appointment.doctorName);
    setFormDoctorSpecialty(appointment.doctorSpecialty);
    setFormNotes(appointment.notes);
    
    setModalVisible(true);
  };
  
  // Handle saving the appointment
  const handleSaveAppointment = () => {
    if (!formTitle.trim()) {
      Alert.alert('Error', 'Please enter an appointment title');
      return;
    }
    
    const formattedDate = formDate.toISOString().split('T')[0];
    const formattedTime = `${String(formTime.getHours()).padStart(2, '0')}:${String(formTime.getMinutes()).padStart(2, '0')}`;
    
    if (editingAppointment) {
      // Update existing appointment
      const updatedAppointments = appointments.map(appointment => 
        appointment.id === editingAppointment.id 
          ? {
              ...appointment,
              title: formTitle,
              date: formattedDate,
              time: formattedTime,
              location: formLocation,
              doctorName: formDoctorName,
              doctorSpecialty: formDoctorSpecialty,
              notes: formNotes
            }
          : appointment
      );
      
      setAppointments(updatedAppointments);
    } else {
      // Create new appointment
      const newAppointment: Appointment = {
        id: Date.now().toString(),
        title: formTitle,
        date: formattedDate,
        time: formattedTime,
        location: formLocation,
        doctorName: formDoctorName,
        doctorSpecialty: formDoctorSpecialty,
        notes: formNotes
      };
      
      setAppointments([...appointments, newAppointment]);
    }
    
    // Close the modal
    setModalVisible(false);
    
    // If the appointment date is different from selected date, update selected date
    if (formattedDate !== selectedDate) {
      setSelectedDate(formattedDate);
    }
  };
  
  // Handle deleting an appointment
  const handleDeleteAppointment = () => {
    if (editingAppointment) {
      Alert.alert(
        'Delete Appointment',
        'Are you sure you want to delete this appointment?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: () => {
              const updatedAppointments = appointments.filter(
                appointment => appointment.id !== editingAppointment.id
              );
              setAppointments(updatedAppointments);
              setModalVisible(false);
            }
          }
        ]
      );
    }
  };
  
  // Handle date picker changes
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormDate(selectedDate);
    }
  };
  
  // Handle time picker changes
  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setFormTime(selectedTime);
    }
  };
  
  // Format date for display
  const formatDisplayDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  
  // Format time for display
  const formatDisplayTime = (time: Date) => {
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${String(minutes).padStart(2, '0')} ${ampm}`;
  };
  
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
    dotColor: Colors[colorScheme].notification,
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
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      {/* Calendar */}
      <View style={[styles.calendarContainer, { backgroundColor: Colors[colorScheme].card }]}>
        <RNCalendar
          markedDates={markedDates}
          onDayPress={day => setSelectedDate(day.dateString)}
          theme={calendarTheme}
          enableSwipeMonths
        />
      </View>
      
      {/* Appointments for selected date */}
      <View style={styles.appointmentsHeader}>
        <Text style={[styles.appointmentsTitle, { color: Colors[colorScheme].text }]}>
          Appointments for {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </Text>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: Colors[colorScheme].tint }]}
          onPress={handleAddAppointment}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
        </View>
      ) : appointmentsForSelectedDate.length === 0 ? (
        <View style={styles.noAppointmentsContainer}>
          <Ionicons 
            name="calendar-outline" 
            size={64} 
            color={isDark ? '#455A64' : '#E0E0E0'} 
          />
          <Text style={[styles.noAppointmentsText, { color: isDark ? '#A0B4C5' : '#757575' }]}>
            No appointments for this day
          </Text>
          <TouchableOpacity 
            style={[styles.scheduleButton, { backgroundColor: Colors[colorScheme].tint }]}
            onPress={handleAddAppointment}
          >
            <Text style={styles.scheduleButtonText}>Schedule Appointment</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.appointmentsList}>
          {appointmentsForSelectedDate.map(appointment => (
            <TouchableOpacity
              key={appointment.id}
              style={[styles.appointmentCard, { backgroundColor: Colors[colorScheme].card }]}
              onPress={() => handleEditAppointment(appointment)}
            >
              <View style={styles.appointmentTimeContainer}>
                <Text style={[styles.appointmentTime, { color: Colors[colorScheme].tint }]}>
                  {appointment.time.substring(0, 5)}
                </Text>
              </View>
              <View style={styles.appointmentDetails}>
                <Text style={[styles.appointmentTitle, { color: Colors[colorScheme].text }]}>
                  {appointment.title}
                </Text>
                <Text style={[styles.appointmentLocation, { color: isDark ? '#A0B4C5' : '#757575' }]}>
                  <Ionicons name="location-outline" size={14} /> {appointment.location}
                </Text>
                <Text style={[styles.appointmentDoctor, { color: isDark ? '#A0B4C5' : '#757575' }]}>
                  <Ionicons name="person-outline" size={14} /> {appointment.doctorName} • {appointment.doctorSpecialty}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
      
      {/* Add/Edit Appointment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: Colors[colorScheme].card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: Colors[colorScheme].text }]}>
                {editingAppointment ? 'Edit Appointment' : 'New Appointment'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors[colorScheme].text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.formContainer}>
              {/* Title */}
              <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Title</Text>
              <TextInput
                style={[
                  styles.textInput,
                  { 
                    color: Colors[colorScheme].text,
                    backgroundColor: isDark ? '#132F4C' : '#F5F9FC',
                    borderColor: isDark ? '#1E3A5F' : '#E0E0E0'
                  }
                ]}
                placeholder="Appointment Title"
                placeholderTextColor={isDark ? '#A0B4C5' : '#AAAAAA'}
                value={formTitle}
                onChangeText={setFormTitle}
              />
              
              {/* Date */}
              <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Date</Text>
              <TouchableOpacity 
                style={[
                  styles.dateTimePicker,
                  { 
                    backgroundColor: isDark ? '#132F4C' : '#F5F9FC',
                    borderColor: isDark ? '#1E3A5F' : '#E0E0E0'
                  }
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color={isDark ? '#A0B4C5' : '#757575'} />
                <Text style={[styles.dateTimeText, { color: Colors[colorScheme].text }]}>
                  {formatDisplayDate(formDate)}
                </Text>
              </TouchableOpacity>
              
              {/* Time */}
              <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Time</Text>
              <TouchableOpacity 
                style={[
                  styles.dateTimePicker,
                  { 
                    backgroundColor: isDark ? '#132F4C' : '#F5F9FC',
                    borderColor: isDark ? '#1E3A5F' : '#E0E0E0'
                  }
                ]}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color={isDark ? '#A0B4C5' : '#757575'} />
                <Text style={[styles.dateTimeText, { color: Colors[colorScheme].text }]}>
                  {formatDisplayTime(formTime)}
                </Text>
              </TouchableOpacity>
              
              {/* Location */}
              <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Location</Text>
              <TextInput
                style={[
                  styles.textInput,
                  { 
                    color: Colors[colorScheme].text,
                    backgroundColor: isDark ? '#132F4C' : '#F5F9FC',
                    borderColor: isDark ? '#1E3A5F' : '#E0E0E0'
                  }
                ]}
                placeholder="Location"
                placeholderTextColor={isDark ? '#A0B4C5' : '#AAAAAA'}
                value={formLocation}
                onChangeText={setFormLocation}
              />
              
              {/* Doctor Name */}
              <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Doctor Name</Text>
              <TextInput
                style={[
                  styles.textInput,
                  { 
                    color: Colors[colorScheme].text,
                    backgroundColor: isDark ? '#132F4C' : '#F5F9FC',
                    borderColor: isDark ? '#1E3A5F' : '#E0E0E0'
                  }
                ]}
                placeholder="Doctor Name"
                placeholderTextColor={isDark ? '#A0B4C5' : '#AAAAAA'}
                value={formDoctorName}
                onChangeText={setFormDoctorName}
              />
              
              {/* Doctor Specialty */}
              <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Doctor Specialty</Text>
              <TextInput
                style={[
                  styles.textInput,
                  { 
                    color: Colors[colorScheme].text,
                    backgroundColor: isDark ? '#132F4C' : '#F5F9FC',
                    borderColor: isDark ? '#1E3A5F' : '#E0E0E0'
                  }
                ]}
                placeholder="Doctor Specialty"
                placeholderTextColor={isDark ? '#A0B4C5' : '#AAAAAA'}
                value={formDoctorSpecialty}
                onChangeText={setFormDoctorSpecialty}
              />
              
              {/* Notes */}
              <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Notes</Text>
              <TextInput
                style={[
                  styles.textInputMultiline,
                  { 
                    color: Colors[colorScheme].text,
                    backgroundColor: isDark ? '#132F4C' : '#F5F9FC',
                    borderColor: isDark ? '#1E3A5F' : '#E0E0E0'
                  }
                ]}
                placeholder="Notes"
                placeholderTextColor={isDark ? '#A0B4C5' : '#AAAAAA'}
                value={formNotes}
                onChangeText={setFormNotes}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </ScrollView>
            
            <View style={styles.modalActions}>
              {editingAppointment && (
                <TouchableOpacity 
                  style={[styles.deleteButton, { backgroundColor: '#FF3B30' }]}
                  onPress={handleDeleteAppointment}
                >
                  <Text style={styles.saveButtonText}>Delete</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={[styles.saveButton, { backgroundColor: Colors[colorScheme].tint }]}
                onPress={handleSaveAppointment}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      
        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            testID="datePicker"
            value={formDate}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={onDateChange}
          />
        )}
        
        {/* Time Picker */}
        {showTimePicker && (
          <DateTimePicker
            testID="timePicker"
            value={formTime}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={onTimeChange}
          />
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendarContainer: {
    borderRadius: 12,
    padding: 10,
    marginVertical: 10,
    marginHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  appointmentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginVertical: 15,
  },
  appointmentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noAppointmentsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noAppointmentsText: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  scheduleButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
  },
  scheduleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  appointmentsList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  appointmentCard: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.5,
  },
  appointmentTimeContainer: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  appointmentTime: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  appointmentDetails: {
    flex: 1,
    padding: 15,
    paddingLeft: 0,
    borderLeftWidth: 1,
    borderLeftColor: '#f0f0f0',
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  appointmentLocation: {
    fontSize: 14,
    marginBottom: 4,
  },
  appointmentDoctor: {
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  formContainer: {
    maxHeight: 400,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 16,
  },
  textInputMultiline: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingTop: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  dateTimePicker: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeText: {
    fontSize: 16,
    marginLeft: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  saveButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    elevation: 2,
  },
  deleteButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginRight: 10,
    elevation: 2,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});