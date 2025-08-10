// Cardboard Theme Colors
const colors = {
  cardboard: "#D2B48C",
  offWhite: "#F8F7F4", 
  barcodeBlack: "#1A1A1A",
  tapeBrown: "#7B5E3B",
  accentOrange: "#FF8C42",
  accentGreen: "#2E7D32",
};

// Simple Navigation State
const screens = {
  WELCOME: 'WELCOME',
  LOGIN: 'LOGIN', 
  BOOK_PICKUP: 'BOOK_PICKUP',
  ORDER_STATUS: 'ORDER_STATUS',
};

// Zustand Store
const useApp = create((set) => ({
  user: null,
  currentScreen: screens.WELCOME,
  currentOrderId: null,
  orders: {
    DEMO01: {
      id: 'DEMO01',
      status: 'created',
      createdAt: Date.now() - 20 * 60 * 1000,
      customerName: 'Jordan',
      pickupAddress: '500 Market St, Apt 2C',
      retailer: 'Target',
      notes: 'QR code in email',
      price: 15
    },
  },
  navigate: (screen, params = {}) => {
    set({ currentScreen: screen, ...params });
  },
  createOrder: (orderData) => {
    const id = Math.random().toString(36).slice(2, 8).toUpperCase();
    const order = { 
      id, 
      status: 'created', 
      createdAt: Date.now(), 
      ...orderData 
    };
    set((state) => ({ 
      orders: { ...state.orders, [id]: order } 
    }));
    return id;
  },
  updateOrder: (id, patch) => {
    set((state) => ({
      orders: {
        ...state.orders,
        [id]: { ...state.orders[id], ...patch }
      }
    }));
  },
  signIn: (name, asDriver) => {
    set({ 
      user: { 
        id: 'u_' + Date.now(), 
        name, 
        isDriver: asDriver 
      } 
    });
  },
  signOut: () => set({ user: null }),
}));

// Welcome Screen Component
const WelcomeScreen = () => {
  const navigate = useApp((s) => s.navigate);

  return (
    <ScrollView style={styles.container}>
      {/* Hero Section */}
      <View style={styles.header}>
        <Text style={styles.title}>Returnly</Text>
        <Text style={styles.subtitle}>
          Your returns delivered. Zero hassle.
        </Text>
      </View>

      {/* Promotional Banner */}
      <View style={styles.promoBanner}>
        <Text style={styles.promoText}>🎉 Limited Time: 50% OFF First Return</Text>
        <Text style={styles.promoCode}>Use code: RETURN50</Text>
      </View>

      {/* Main CTA */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Book Your Return Pickup</Text>
        <Text style={styles.cardSubtitle}>
          From $7.99 • Pick up in 2 hours • 500+ retail partners
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigate(screens.BOOK_PICKUP)}
          >
            <Text style={styles.primaryButtonText}>Start Return 📦</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigate(screens.ORDER_STATUS)}
          >
            <Text style={styles.secondaryButtonText}>Track Order</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Customer Reviews */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>⭐ What Our Customers Say</Text>
        <View style={styles.reviewContainer}>
          <View style={styles.review}>
            <Text style={styles.reviewStars}>⭐⭐⭐⭐⭐</Text>
            <Text style={styles.reviewText}>
              "Saved me 2 hours at the mall! Driver was super friendly."
            </Text>
            <Text style={styles.reviewAuthor}>— Sarah M., San Francisco</Text>
          </View>
          <View style={styles.review}>
            <Text style={styles.reviewStars}>⭐⭐⭐⭐⭐</Text>
            <Text style={styles.reviewText}>
              "Perfect for busy parents. Returned 3 packages while kids napped."
            </Text>
            <Text style={styles.reviewAuthor}>— Mike D., Austin</Text>
          </View>
        </View>
      </View>

      {/* How It Works */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>📋 How Returnly Works</Text>
        <View style={styles.stepContainer}>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.stepText}>Book pickup online or in app</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>2</Text>
            <Text style={styles.stepText}>Hand package to our driver</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>3</Text>
            <Text style={styles.stepText}>We handle the return for you</Text>
          </View>
        </View>
      </View>

      {/* Retail Partners */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🏪 Trusted Retail Partners</Text>
        <View style={styles.retailGrid}>
          <View style={styles.retailLogo}><Text style={styles.retailText}>Target</Text></View>
          <View style={styles.retailLogo}><Text style={styles.retailText}>Best Buy</Text></View>
          <View style={styles.retailLogo}><Text style={styles.retailText}>Macy's</Text></View>
          <View style={styles.retailLogo}><Text style={styles.retailText}>REI</Text></View>
          <View style={styles.retailLogo}><Text style={styles.retailText}>Nike</Text></View>
          <View style={styles.retailLogo}><Text style={styles.retailText}>+495 more</Text></View>
        </View>
      </View>

      {/* Current Deals */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>💰 Current Deals</Text>
        <View style={styles.dealContainer}>
          <View style={styles.deal}>
            <Text style={styles.dealTitle}>Bundle Returns</Text>
            <Text style={styles.dealDesc}>Return 3+ items, save 25%</Text>
            <Text style={styles.dealCode}>BUNDLE25</Text>
          </View>
          <View style={styles.deal}>
            <Text style={styles.dealTitle}>Student Discount</Text>
            <Text style={styles.dealDesc}>15% off with .edu email</Text>
            <Text style={styles.dealCode}>STUDENT15</Text>
          </View>
        </View>
      </View>

      {/* Driver Section */}
      <View style={styles.card}>
        <View style={styles.driverCardContent}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🚚</Text>
          </View>
          <View style={styles.driverTextContainer}>
            <Text style={styles.cardTitle}>Earn as a Returnly Driver</Text>
            <Text style={styles.cardSubtitle}>
              $18-25/hour • Flexible schedule • Weekly pay
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.downloadButton}
            onPress={() => Alert.alert('Driver Portal', 'Coming soon to App Store & Google Play!\n\nEarn up to $25/hour with flexible scheduling.')}
          >
            <Text style={styles.primaryButtonText}>Apply Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigate(screens.LOGIN)}>
          <Text style={styles.footerLink}>Sign In</Text>
        </TouchableOpacity>
        <Text style={styles.footerSeparator}>•</Text>
        <TouchableOpacity>
          <Text style={styles.footerLink}>Help Center</Text>
        </TouchableOpacity>
        <Text style={styles.footerSeparator}>•</Text>
        <TouchableOpacity>
          <Text style={styles.footerLink}>About Us</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Login Screen Component
const LoginScreen = () => {
  const { signIn, navigate } = useApp((s) => ({ signIn: s.signIn, navigate: s.navigate }));
  const [name, setName] = useState('');
  const [asDriver, setAsDriver] = useState(false);

  const handleLogin = () => {
    if (!name.trim()) return;
    
    if (asDriver) {
      Alert.alert(
        'Download Driver App',
        'Drivers should download the Returnly Driver mobile app to accept jobs and manage deliveries.'
      );
      return;
    }
    
    signIn(name, asDriver);
    navigate(screens.BOOK_PICKUP);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Your name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={colors.tapeBrown}
          />
        </View>

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, asDriver ? styles.selectedToggle : styles.unselectedToggle]}
            onPress={() => setAsDriver(true)}
          >
            <Text style={asDriver ? styles.selectedToggleText : styles.unselectedToggleText}>
              I'm a Driver
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, !asDriver ? styles.selectedToggle : styles.unselectedToggle]}
            onPress={() => setAsDriver(false)}
          >
            <Text style={!asDriver ? styles.selectedToggleText : styles.unselectedToggleText}>
              I'm a Customer
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.continueButton, !name.trim() && styles.disabledButton]}
          disabled={!name.trim()}
          onPress={handleLogin}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Book Pickup Screen Component
const BookPickupScreen = () => {
  const { createOrder, navigate, user } = useApp((s) => ({ 
    createOrder: s.createOrder, 
    navigate: s.navigate,
    user: s.user 
  }));

  // Required fields
  const [fullName, setFullName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [retailer, setRetailer] = useState('');
  const [returnMethod, setReturnMethod] = useState('store');
  const [packageSize, setPackageSize] = useState('M');
  const [timeSlot, setTimeSlot] = useState('ASAP');
  
  // Optional fields
  const [notes, setNotes] = useState('');
  const [hasReceipt, setHasReceipt] = useState(false);
  const [hasPackagePhoto, setHasPackagePhoto] = useState(false);
  
  // Form validation
  const [errors, setErrors] = useState({});
  
  const price = 15;

  const validateForm = () => {
    const newErrors = {};
    
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\+?[\d\s\-\(\)]+$/.test(phone.trim())) newErrors.phone = 'Invalid phone format';
    if (!pickupAddress.trim()) newErrors.pickupAddress = 'Pickup address is required';
    if (!retailer.trim()) newErrors.retailer = 'Retailer is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateOrder = () => {
    if (!validateForm()) return;
    
    const id = createOrder({
      customerName: fullName,
      phone,
      pickupAddress,
      retailer,
      returnMethod,
      packageSize,
      timeSlot,
      notes,
      hasReceipt,
      hasPackagePhoto,
      price
    });
    navigate(screens.ORDER_STATUS, { currentOrderId: id });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Book a pickup</Text>
        <Text style={styles.subtitle}>We'll handle the return for you</Text>
      </View>

      <View style={styles.card}>
        {/* Required Fields */}
        <Text style={styles.sectionHeader}>Required Information</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full name *</Text>
          <TextInput
            style={[styles.input, errors.fullName && styles.inputError]}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            placeholderTextColor={colors.tapeBrown}
          />
          {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone number *</Text>
          <TextInput
            style={[styles.input, errors.phone && styles.inputError]}
            value={phone}
            onChangeText={setPhone}
            placeholder="+1 (555) 123-4567"
            placeholderTextColor={colors.tapeBrown}
            keyboardType="phone-pad"
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Pickup address *</Text>
          <TextInput
            style={[styles.input, errors.pickupAddress && styles.inputError]}
            value={pickupAddress}
            onChangeText={setPickupAddress}
            placeholder="123 Main St, Apt 2C, City, State 12345"
            placeholderTextColor={colors.tapeBrown}
          />
          {errors.pickupAddress && <Text style={styles.errorText}>{errors.pickupAddress}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Retailer *</Text>
          <TextInput
            style={[styles.input, errors.retailer && styles.inputError]}
            value={retailer}
            onChangeText={setRetailer}
            placeholder="Target, Amazon, Best Buy, etc."
            placeholderTextColor={colors.tapeBrown}
          />
          {errors.retailer && <Text style={styles.errorText}>{errors.retailer}</Text>}
        </View>

        {/* Return Method */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Return method *</Text>
          <View style={styles.pickerContainer}>
            {['store', 'UPS', 'FedEx', 'USPS'].map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.pickerOption,
                  returnMethod === method ? styles.pickerSelected : styles.pickerUnselected
                ]}
                onPress={() => setReturnMethod(method)}
              >
                <Text style={returnMethod === method ? styles.pickerSelectedText : styles.pickerUnselectedText}>
                  {method}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Package Size */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Package size *</Text>
          <View style={styles.pickerContainer}>
            {[
              { value: 'S', label: 'Small' },
              { value: 'M', label: 'Medium' },
              { value: 'L', label: 'Large' }
            ].map((size) => (
              <TouchableOpacity
                key={size.value}
                style={[
                  styles.pickerOption,
                  packageSize === size.value ? styles.pickerSelected : styles.pickerUnselected
                ]}
                onPress={() => setPackageSize(size.value)}
              >
                <Text style={packageSize === size.value ? styles.pickerSelectedText : styles.pickerUnselectedText}>
                  {size.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Time Slot */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Pickup window *</Text>
          <View style={styles.pickerContainer}>
            {['ASAP', 'Morning (9AM-12PM)', 'Afternoon (12PM-5PM)', 'Evening (5PM-8PM)'].map((slot) => (
              <TouchableOpacity
                key={slot}
                style={[
                  styles.pickerOptionWide,
                  timeSlot === slot ? styles.pickerSelected : styles.pickerUnselected
                ]}
                onPress={() => setTimeSlot(slot)}
              >
                <Text style={timeSlot === slot ? styles.pickerSelectedText : styles.pickerUnselectedText}>
                  {slot}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Optional Fields */}
        <Text style={styles.sectionHeader}>Optional</Text>

        {/* Upload Options */}
        <View style={styles.uploadContainer}>
          <TouchableOpacity
            style={[styles.uploadOption, hasReceipt && styles.uploadSelected]}
            onPress={() => setHasReceipt(!hasReceipt)}
          >
            <Text style={styles.uploadIcon}>📄</Text>
            <Text style={hasReceipt ? styles.uploadSelectedText : styles.uploadText}>
              Receipt uploaded
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.uploadOption, hasPackagePhoto && styles.uploadSelected]}
            onPress={() => setHasPackagePhoto(!hasPackagePhoto)}
          >
            <Text style={styles.uploadIcon}>📷</Text>
            <Text style={hasPackagePhoto ? styles.uploadSelectedText : styles.uploadText}>
              Package photo
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Special instructions</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            placeholder="Gate code, fragile items, specific location, etc."
            placeholderTextColor={colors.tapeBrown}
          />
        </View>

        <View style={styles.divider} />

        <Text style={styles.priceText}>Estimated price: ${price}</Text>

        <TouchableOpacity
          style={[styles.createButton, (!fullName.trim() || !phone.trim() || !pickupAddress.trim() || !retailer.trim()) && styles.disabledButton]}
          disabled={!fullName.trim() || !phone.trim() || !pickupAddress.trim() || !retailer.trim()}
          onPress={handleCreateOrder}
        >
          <Text style={styles.createButtonText}>Pay & Create Order (mock)</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Order Status Screen Component  
const OrderStatusScreen = () => {
  const { orders, updateOrder, navigate, currentOrderId } = useApp((s) => ({ 
    orders: s.orders, 
    updateOrder: s.updateOrder,
    navigate: s.navigate,
    currentOrderId: s.currentOrderId
  }));
  
  const order = currentOrderId ? orders[currentOrderId] : undefined;

  if (!order) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Order not found</Text>
        </View>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigate(screens.BOOK_PICKUP)}
        >
          <Text style={styles.backButtonText}>Back to booking</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const steps = ['created', 'assigned', 'picked_up', 'dropped_off', 'refunded'];
  const currentIndex = steps.indexOf(order.status);

  const formatDate = (date) => {
    const dateObj = typeof date === 'number' ? new Date(date) : date;
    return dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const handleAdvanceStatus = () => {
    if (currentIndex < steps.length - 1) {
      updateOrder(order.id, { status: steps[currentIndex + 1] });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Order #{order.id}</Text>
        <Text style={styles.subtitle}>Created {formatDate(order.createdAt)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.retailerName}>{order.retailer}</Text>
        <Text style={styles.address}>{order.pickupAddress}</Text>

        <View style={styles.divider} />

        <Text style={styles.statusLabel}>Status</Text>
        
        <View style={styles.chipContainer}>
          {steps.map((step, idx) => (
            <View
              key={step}
              style={[
                styles.chip, 
                idx <= currentIndex ? styles.activeChip : styles.inactiveChip
              ]}
            >
              <Text style={idx <= currentIndex ? styles.activeChipText : styles.inactiveChipText}>
                {step.replace('_', ' ')}
              </Text>
            </View>
          ))}
        </View>

        {currentIndex < steps.length - 1 && (
          <TouchableOpacity
            style={styles.advanceButton}
            onPress={handleAdvanceStatus}
          >
            <Text style={styles.advanceButtonText}>Advance (demo)</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => navigate(screens.WELCOME)}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Main App Component
export default function App() {
  const currentScreen = useApp((s) => s.currentScreen);

  const renderScreen = () => {
    switch (currentScreen) {
      case screens.LOGIN:
        return <LoginScreen />;
      case screens.BOOK_PICKUP:
        return <BookPickupScreen />;
      case screens.ORDER_STATUS:
        return <OrderStatusScreen />;
      default:
        return <WelcomeScreen />;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {renderScreen()}
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhite,
    paddingHorizontal: Platform.OS === 'web' ? '5%' : 18,
    paddingTop: Platform.OS === 'web' ? 40 : 50,
    maxWidth: Platform.OS === 'web' ? 1200 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginBottom: Platform.OS === 'web' ? 40 : 24,
    alignItems: Platform.OS === 'web' ? 'center' : 'flex-start',
    paddingBottom: Platform.OS === 'web' ? 20 : 0,
    borderBottomWidth: Platform.OS === 'web' ? 1 : 0,
    borderBottomColor: colors.cardboard,
  },
  title: {
    color: colors.barcodeBlack,
    fontWeight: '800',
    fontSize: Platform.OS === 'web' ? 48 : 32,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'system-ui',
    }),
    textAlign: Platform.OS === 'web' ? 'center' : 'left',
  },
  subtitle: {
    color: colors.tapeBrown,
    marginTop: Platform.OS === 'web' ? 12 : 8,
    fontSize: Platform.OS === 'web' ? 20 : 16,
    lineHeight: Platform.OS === 'web' ? 28 : 22,
    textAlign: Platform.OS === 'web' ? 'center' : 'left',
    maxWidth: Platform.OS === 'web' ? 600 : '100%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Platform.OS === 'web' ? 16 : 12,
    padding: Platform.OS === 'web' ? 32 : 20,
    marginBottom: Platform.OS === 'web' ? 24 : 16,
    borderWidth: 1,
    borderColor: colors.cardboard,
    shadowColor: colors.cardboard,
    shadowOffset: { width: 0, height: Platform.OS === 'web' ? 8 : 2 },
    shadowOpacity: Platform.OS === 'web' ? 0.1 : 0.2,
    shadowRadius: Platform.OS === 'web' ? 16 : 4,
    elevation: Platform.OS === 'web' ? 8 : 3,
    maxWidth: Platform.OS === 'web' ? 800 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  cardTitle: {
    color: colors.barcodeBlack,
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 8,
  },
  cardSubtitle: {
    color: colors.tapeBrown,
    marginBottom: 16,
    lineHeight: 20,
    fontSize: 15,
  },
  buttonRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'row',
    gap: Platform.OS === 'web' ? 16 : 12,
    flexWrap: 'wrap',
    justifyContent: Platform.OS === 'web' ? 'center' : 'flex-start',
    marginTop: Platform.OS === 'web' ? 8 : 0,
  },
  button: {
    flex: Platform.OS === 'web' ? 0 : 1,
    minWidth: Platform.OS === 'web' ? 180 : 120,
    paddingVertical: Platform.OS === 'web' ? 16 : 12,
    paddingHorizontal: Platform.OS === 'web' ? 32 : 16,
    borderRadius: Platform.OS === 'web' ? 16 : 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: colors.accentOrange,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: Platform.OS === 'web' ? 18 : 16,
    letterSpacing: Platform.OS === 'web' ? 0.5 : 0,
  },
  secondaryButton: {
    backgroundColor: colors.cardboard,
    borderWidth: 1,
    borderColor: colors.tapeBrown,
  },
  secondaryButtonText: {
    color: colors.barcodeBlack,
    fontWeight: '600',
    fontSize: Platform.OS === 'web' ? 18 : 16,
    letterSpacing: Platform.OS === 'web' ? 0.5 : 0,
  },
  driverCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentOrange + '33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  driverTextContainer: {
    flex: 1,
  },
  downloadButton: {
    backgroundColor: colors.cardboard,
    borderWidth: 1,
    borderColor: colors.tapeBrown,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  // Login Screen Styles
  inputContainer: {
    marginBottom: Platform.OS === 'web' ? 24 : 16,
  },
  label: {
    color: colors.barcodeBlack,
    marginBottom: Platform.OS === 'web' ? 12 : 8,
    fontWeight: '600',
    fontSize: Platform.OS === 'web' ? 18 : 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: Platform.OS === 'web' ? 2 : 1,
    borderColor: colors.cardboard,
    borderRadius: Platform.OS === 'web' ? 12 : 8,
    paddingHorizontal: Platform.OS === 'web' ? 20 : 12,
    paddingVertical: Platform.OS === 'web' ? 16 : 12,
    fontSize: Platform.OS === 'web' ? 18 : 16,
    color: colors.barcodeBlack,
    transition: Platform.OS === 'web' ? 'border-color 0.2s ease' : 'none',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  selectedToggle: {
    backgroundColor: colors.accentOrange,
    borderColor: colors.accentOrange,
  },
  unselectedToggle: {
    backgroundColor: colors.cardboard,
    borderColor: colors.tapeBrown,
  },
  selectedToggleText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  unselectedToggleText: {
    color: colors.barcodeBlack,
    fontWeight: '600',
    fontSize: 16,
  },
  continueButton: {
    backgroundColor: colors.accentOrange,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  // Book Pickup Screen Styles
  divider: {
    height: 1,
    backgroundColor: colors.cardboard,
    marginVertical: 16,
  },
  priceText: {
    color: colors.barcodeBlack,
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: colors.accentOrange,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  // Order Status Screen Styles
  retailerName: {
    color: colors.barcodeBlack,
    fontWeight: '700',
    fontSize: 20,
    marginBottom: 4,
  },
  address: {
    color: colors.tapeBrown,
    fontSize: 16,
    marginBottom: 16,
  },
  statusLabel: {
    color: colors.barcodeBlack,
    fontWeight: '600',
    fontSize: 18,
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  activeChip: {
    backgroundColor: colors.accentOrange,
    borderColor: colors.accentOrange,
  },
  inactiveChip: {
    backgroundColor: colors.cardboard + '66',
    borderColor: colors.cardboard,
  },
  activeChipText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  inactiveChipText: {
    color: colors.tapeBrown,
    fontWeight: '500',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  advanceButton: {
    backgroundColor: colors.cardboard,
    borderWidth: 1,
    borderColor: colors.tapeBrown,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  advanceButtonText: {
    color: colors.barcodeBlack,
    fontWeight: '600',
    fontSize: 16,
  },
  doneButton: {
    backgroundColor: colors.accentOrange,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  backButton: {
    backgroundColor: colors.accentOrange,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  // Enhanced Form Styles
  sectionHeader: {
    color: colors.barcodeBlack,
    fontWeight: '700',
    fontSize: Platform.OS === 'web' ? 24 : 18,
    marginBottom: Platform.OS === 'web' ? 24 : 16,
    marginTop: Platform.OS === 'web' ? 16 : 8,
    textAlign: Platform.OS === 'web' ? 'center' : 'left',
    borderBottomWidth: Platform.OS === 'web' ? 2 : 0,
    borderBottomColor: colors.cardboard,
    paddingBottom: Platform.OS === 'web' ? 12 : 0,
  },
  inputError: {
    borderColor: '#E74C3C',
    borderWidth: 2,
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Platform.OS === 'web' ? 12 : 8,
    justifyContent: Platform.OS === 'web' ? 'center' : 'flex-start',
  },
  pickerOption: {
    paddingVertical: Platform.OS === 'web' ? 12 : 8,
    paddingHorizontal: Platform.OS === 'web' ? 24 : 16,
    borderRadius: Platform.OS === 'web' ? 12 : 8,
    borderWidth: Platform.OS === 'web' ? 2 : 1,
    minWidth: Platform.OS === 'web' ? 100 : 80,
    alignItems: 'center',
    transition: Platform.OS === 'web' ? 'all 0.2s ease' : 'none',
  },
  pickerOptionWide: {
    paddingVertical: Platform.OS === 'web' ? 12 : 8,
    paddingHorizontal: Platform.OS === 'web' ? 24 : 16,
    borderRadius: Platform.OS === 'web' ? 12 : 8,
    borderWidth: Platform.OS === 'web' ? 2 : 1,
    flex: 1,
    minWidth: Platform.OS === 'web' ? '48%' : '45%',
    alignItems: 'center',
    marginBottom: Platform.OS === 'web' ? 12 : 8,
    transition: Platform.OS === 'web' ? 'all 0.2s ease' : 'none',
  },
  pickerSelected: {
    backgroundColor: colors.accentOrange,
    borderColor: colors.accentOrange,
  },
  pickerUnselected: {
    backgroundColor: colors.cardboard,
    borderColor: colors.tapeBrown,
  },
  pickerSelectedText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  pickerUnselectedText: {
    color: colors.barcodeBlack,
    fontWeight: '500',
    fontSize: 14,
  },
  uploadContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  uploadOption: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardboard,
    backgroundColor: colors.cardboard + '33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadSelected: {
    backgroundColor: colors.accentOrange + '33',
    borderColor: colors.accentOrange,
  },
  uploadIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  uploadText: {
    color: colors.tapeBrown,
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  uploadSelectedText: {
    color: colors.accentOrange,
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  // Website-like promotional styles
  promoBanner: {
    backgroundColor: colors.accentOrange,
    paddingVertical: Platform.OS === 'web' ? 20 : 16,
    paddingHorizontal: Platform.OS === 'web' ? 32 : 20,
    borderRadius: Platform.OS === 'web' ? 16 : 12,
    marginBottom: Platform.OS === 'web' ? 24 : 16,
    alignItems: 'center',
    shadowColor: colors.accentOrange,
    shadowOffset: { width: 0, height: Platform.OS === 'web' ? 4 : 2 },
    shadowOpacity: 0.3,
    shadowRadius: Platform.OS === 'web' ? 8 : 4,
    elevation: 4,
  },
  promoText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: Platform.OS === 'web' ? 20 : 16,
    textAlign: 'center',
    marginBottom: 4,
  },
  promoCode: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: Platform.OS === 'web' ? 16 : 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sectionTitle: {
    color: colors.barcodeBlack,
    fontWeight: '700',
    fontSize: Platform.OS === 'web' ? 22 : 18,
    marginBottom: Platform.OS === 'web' ? 20 : 16,
    textAlign: Platform.OS === 'web' ? 'center' : 'left',
  },
  reviewContainer: {
    gap: Platform.OS === 'web' ? 16 : 12,
  },
  review: {
    backgroundColor: colors.offWhite,
    padding: Platform.OS === 'web' ? 20 : 16,
    borderRadius: Platform.OS === 'web' ? 12 : 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.accentGreen,
  },
  reviewStars: {
    fontSize: Platform.OS === 'web' ? 16 : 14,
    marginBottom: 8,
  },
  reviewText: {
    color: colors.barcodeBlack,
    fontSize: Platform.OS === 'web' ? 16 : 14,
    fontStyle: 'italic',
    lineHeight: Platform.OS === 'web' ? 22 : 20,
    marginBottom: 8,
  },
  reviewAuthor: {
    color: colors.tapeBrown,
    fontSize: Platform.OS === 'web' ? 14 : 12,
    fontWeight: '600',
  },
  stepContainer: {
    gap: Platform.OS === 'web' ? 20 : 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.offWhite,
    padding: Platform.OS === 'web' ? 20 : 16,
    borderRadius: Platform.OS === 'web' ? 12 : 8,
    gap: Platform.OS === 'web' ? 16 : 12,
  },
  stepNumber: {
    backgroundColor: colors.accentOrange,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: Platform.OS === 'web' ? 18 : 16,
    width: Platform.OS === 'web' ? 36 : 32,
    height: Platform.OS === 'web' ? 36 : 32,
    borderRadius: Platform.OS === 'web' ? 18 : 16,
    textAlign: 'center',
    lineHeight: Platform.OS === 'web' ? 36 : 32,
  },
  stepText: {
    color: colors.barcodeBlack,
    fontSize: Platform.OS === 'web' ? 16 : 14,
    fontWeight: '500',
    flex: 1,
  },
  retailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Platform.OS === 'web' ? 12 : 8,
    justifyContent: 'space-between',
  },
  retailLogo: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.cardboard,
    borderRadius: Platform.OS === 'web' ? 12 : 8,
    paddingVertical: Platform.OS === 'web' ? 16 : 12,
    paddingHorizontal: Platform.OS === 'web' ? 20 : 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: Platform.OS === 'web' ? 120 : 100,
    flex: Platform.OS === 'web' ? 0 : 1,
  },
  retailText: {
    color: colors.barcodeBlack,
    fontWeight: '600',
    fontSize: Platform.OS === 'web' ? 14 : 12,
    textAlign: 'center',
  },
  dealContainer: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: Platform.OS === 'web' ? 16 : 12,
  },
  deal: {
    backgroundColor: colors.offWhite,
    padding: Platform.OS === 'web' ? 20 : 16,
    borderRadius: Platform.OS === 'web' ? 12 : 8,
    borderWidth: 2,
    borderColor: colors.accentGreen,
    flex: Platform.OS === 'web' ? 1 : 0,
    alignItems: 'center',
  },
  dealTitle: {
    color: colors.barcodeBlack,
    fontWeight: '700',
    fontSize: Platform.OS === 'web' ? 18 : 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  dealDesc: {
    color: colors.tapeBrown,
    fontSize: Platform.OS === 'web' ? 14 : 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  dealCode: {
    backgroundColor: colors.accentGreen,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: Platform.OS === 'web' ? 14 : 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Platform.OS === 'web' ? 40 : 32,
    gap: Platform.OS === 'web' ? 16 : 12,
    borderTopWidth: 1,
    borderTopColor: colors.cardboard,
    marginTop: Platform.OS === 'web' ? 24 : 16,
  },
  footerLink: {
    color: colors.tapeBrown,
    fontSize: Platform.OS === 'web' ? 16 : 14,
    fontWeight: '500',
  },
  footerSeparator: {
    color: colors.cardboard,
    fontSize: Platform.OS === 'web' ? 16 : 14,
  },
});